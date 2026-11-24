import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  formatContextForAI,
  getAssistantContext,
  truncateContext,
} from "@/lib/ai/context";
import { AssistantOutputFilter } from "@/lib/ai/output-validation";
import { ASSISTANT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { getAIProvider, isAIConfigured, type AIStreamChunk } from "@/lib/ai/provider";
import { encodeServerSentEvent } from "@/lib/ai/stream-protocol";
import { z } from "zod";

type AIMessage = { role: "user" | "assistant"; content: string };

const maxTokens = 1024;
const maxContextChars = 8000;
const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 20;

function validateRequest(
  body: unknown,
): { ok: true; messages: AIMessage[] } | { ok: false; error: string } {
  const schema = z.object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().trim().min(1).max(2000),
        }),
      )
      .min(1)
      .max(20),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: "Data permintaan tidak valid." };
  }
  return { ok: true, messages: parsed.data.messages };
}

function providerErrorMessage(chunk: AIStreamChunk): string {
  return chunk.type === "error"
    ? chunk.message
    : "Generasi respons dihentikan sebelum selesai.";
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
    }

    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "AI provider belum dikonfigurasi di environment server." },
        { status: 500 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Data permintaan tidak valid." },
        { status: 400 },
      );
    }

    const validation = validateRequest(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { data: rateData, error: rateError } = await supabase.rpc(
      "consume_assistant_rate_limit",
      {
        p_user_id: user.id,
        p_limit: RATE_LIMIT_MAX,
        p_window_seconds: RATE_LIMIT_WINDOW,
      },
    );

    if (rateError) {
      console.error("Assistant rate limit check failed.");
      return NextResponse.json(
        { error: "Gagal memeriksa rate limit. Silakan coba lagi." },
        { status: 500 },
      );
    }

    const allowed = rateData?.[0]?.allowed ?? true;
    const retryAfter = rateData?.[0]?.retry_after ?? RATE_LIMIT_WINDOW;
    if (!allowed) {
      return NextResponse.json(
        {
          error: `Batas permintaan tercapai. Coba lagi dalam ${Math.ceil(retryAfter)} detik.`,
          retryAfter,
        },
        { status: 429 },
      );
    }

    const context = await getAssistantContext(user.id);
    const contextString = truncateContext(
      formatContextForAI(context),
      maxContextChars,
    );
    const provider = getAIProvider();
    const outputFilter = new AssistantOutputFilter();
    const encoder = new TextEncoder();
    let iterator: AsyncIterator<AIStreamChunk> | null = null;
    let streamController: ReadableStreamDefaultController<Uint8Array> | null =
      null;
    let responseTextLength = 0;
    let closed = false;
    let cancelled = false;

    const send = (event: string, data: unknown) => {
      if (!cancelled && !closed && streamController) {
        streamController.enqueue(
          encoder.encode(encodeServerSentEvent(event, data)),
        );
      }
    };
    const close = () => {
      if (!cancelled && !closed && streamController) {
        closed = true;
        streamController.close();
      }
    };

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        streamController = controller;
        iterator = provider
          .stream({
            system: `${ASSISTANT_SYSTEM_PROMPT}\n\n${contextString}`,
            messages: validation.messages,
            maxTokens,
            temperature: 0.8,
            signal: request.signal,
          })
          [Symbol.asyncIterator]();
      },
      async pull() {
        if (cancelled || closed || !iterator) return;

        try {
          while (!cancelled && !closed) {
            const result = await iterator.next();
            if (result.done) {
              send("error", {
                message: "Stream AI terputus sebelum respons dinyatakan selesai.",
              });
              close();
              return;
            }

            const chunk = result.value;
            if (chunk.type === "token") {
              const filtered = outputFilter.push(chunk.token);
              if (filtered.text) {
                responseTextLength += filtered.text.length;
                send("delta", { text: filtered.text });
              }
              if (filtered.invalid) {
                send("error", {
                  message:
                    "Respons AI memuat anotasi internal dan tidak dapat ditampilkan. Coba kirim ulang.",
                });
                await iterator.return?.();
                close();
                return;
              }
              if (filtered.text) {
                return;
              }
              continue;
            }

            if (chunk.type === "error" || chunk.type === "cancelled") {
              send("error", { message: providerErrorMessage(chunk) });
              close();
              return;
            }

            if (chunk.finishReason !== "stop") {
              const message =
                chunk.finishReason === "length"
                  ? "Jawaban mencapai batas panjang sebelum selesai. Respons belum disimpan sebagai selesai."
                  : "AI provider menghentikan respons sebelum selesai. Coba kirim ulang.";
              send("error", { message });
              close();
              return;
            }

            const finalText = outputFilter.finish();
            if (finalText.invalid) {
              send("error", {
                message:
                  "Respons AI memuat anotasi internal dan tidak dapat ditampilkan. Coba kirim ulang.",
              });
              close();
              return;
            }
            if (finalText.text) {
              responseTextLength += finalText.text.length;
              send("delta", { text: finalText.text });
            }
            if (responseTextLength === 0) {
              send("error", {
                message: "AI provider menyelesaikan respons tanpa teks.",
              });
              close();
              return;
            }

            send("complete", { finishReason: chunk.finishReason });
            close();
            return;
          }
        } catch {
          send("error", {
            message: "Stream AI terputus sebelum respons selesai.",
          });
          close();
        }
      },
      async cancel() {
        cancelled = true;
        await iterator?.return?.();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    console.error("AI Assistant API request failed.");
    return NextResponse.json(
      { error: "Terjadi kesalahan di server. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
