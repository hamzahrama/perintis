"use server";

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  formatContextForAI,
  getAssistantContext,
  truncateContext,
} from "@/lib/ai/context";
import { ASSISTANT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { getAIProvider, isAIConfigured } from "@/lib/ai/provider";
import { z } from "zod";

type AIMessage = { role: "system" | "user" | "assistant"; content: string };

const maxTokens = 512;
const maxContextChars = 8000;
const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 20;

function validateRequest(
  body: unknown
): { ok: true; system: string; messages: AIMessage[] } | { ok: false; error: string } {
  const schema = z.object({
    system: z.string().trim().min(1).max(2000).optional(),
    messages: z
      .array(
        z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string().trim().min(1).max(2000),
        })
      )
      .min(1)
      .max(20),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: "Data permintaan tidak valid." };
  }
  return { ok: true, system: parsed.data.system ?? "", messages: parsed.data.messages };
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
    }

    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "AI provider belum dikonfigurasi di environment server." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const validation = validateRequest(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Rate limit via database function
    const { data: rateData, error: rateError } = await supabase.rpc(
      "consume_assistant_rate_limit",
      {
        p_user_id: user.id,
        p_limit: RATE_LIMIT_MAX,
        p_window_seconds: RATE_LIMIT_WINDOW,
      }
    );

    if (rateError) {
      console.error("Rate limit check failed:", rateError);
      return NextResponse.json(
        { error: "Gagal memeriksa rate limit. Silakan coba lagi." },
        { status: 500 }
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
        { status: 429 }
      );
    }

    const context = await getAssistantContext(user.id);
    const contextString = truncateContext(
      formatContextForAI(context),
      maxContextChars
    );

    const provider = getAIProvider();

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const messages: AIMessage[] = [
            {
              role: "system",
              content: ASSISTANT_SYSTEM_PROMPT + "\n\n" + contextString,
            },
            ...validation.messages,
          ];

          for await (const chunk of provider.stream({
            system: ASSISTANT_SYSTEM_PROMPT,
            messages,
            maxTokens,
            temperature: 0.7,
          })) {
            if (chunk.error) {
              controller.error(chunk.error);
              return;
            }
            if (chunk.token) {
              controller.enqueue(encoder.encode(chunk.token));
            }
          }
        } catch {
          controller.error("Gagal menghubungi AI provider. Silakan coba lagi nanti.");
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("AI Assistant API error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan di server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}