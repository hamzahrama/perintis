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
    // Auth check
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
    }

    // Config check
    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "AI provider belum dikonfigurasi di environment server." },
        { status: 500 }
      );
    }

    // Parse body
    const body = await request.json();
    const validation = validateRequest(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Retrieve user context
    const context = await getAssistantContext(user.id);
    const contextString = truncateContext(
      formatContextForAI(context),
      maxContextChars
    );

    const provider = getAIProvider();

    // Stream response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const messages: AIMessage[] = [
            { role: "system", content: ASSISTANT_SYSTEM_PROMPT + "\n\n" + contextString },
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