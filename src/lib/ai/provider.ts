import { ServerSentEventParser } from "@/lib/ai/stream-protocol";

/**
 * AI provider configuration is server-only. Never expose provider credentials
 * or raw provider error bodies to the browser or application logs.
 */
export type AIMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AIRequest = {
  system: string;
  messages: AIMessage[];
  maxTokens: number;
  temperature: number;
  signal?: AbortSignal;
};

export type AIStreamChunk =
  | { type: "token"; token: string }
  | { type: "finish"; finishReason: string }
  | { type: "error"; message: string }
  | { type: "cancelled" };

export interface AIProvider {
  stream(request: AIRequest): AsyncIterable<AIStreamChunk>;
}

function getAIConfig() {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";

  return { configured: Boolean(apiKey), apiKey, baseUrl, model };
}

function readProviderError(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "AI provider mengembalikan kesalahan. Coba lagi nanti.";
  }

  const error = (payload as { error?: unknown }).error;
  if (!error || typeof error !== "object") {
    return "AI provider mengembalikan kesalahan. Coba lagi nanti.";
  }

  const code = (error as { code?: unknown }).code;
  if (typeof code === "string" && /^[a-z0-9_-]{1,48}$/i.test(code)) {
    return `AI provider menghentikan respons (${code}). Coba lagi nanti.`;
  }
  return "AI provider mengembalikan kesalahan. Coba lagi nanti.";
}

function parseProviderFrame(data: string): {
  token?: string;
  finishReason?: string;
  error?: string;
  done: boolean;
} {
  if (data.trim() === "[DONE]") return { done: true };

  let payload: unknown;
  try {
    payload = JSON.parse(data);
  } catch {
    return {
      error: "Format streaming dari AI provider tidak valid.",
      done: false,
    };
  }

  if (!payload || typeof payload !== "object") {
    return {
      error: "Format streaming dari AI provider tidak valid.",
      done: false,
    };
  }

  const record = payload as {
    error?: unknown;
    choices?: Array<{
      delta?: { content?: unknown };
      finish_reason?: unknown;
    }>;
  };
  if (record.error) {
    return { error: readProviderError(payload), done: false };
  }

  const choice = record.choices?.[0];
  const token =
    typeof choice?.delta?.content === "string" ? choice.delta.content : undefined;
  const finishReason =
    typeof choice?.finish_reason === "string"
      ? choice.finish_reason
      : undefined;

  return { token, finishReason, done: false };
}

export const openAIProvider: AIProvider = {
  async *stream(request: AIRequest): AsyncIterable<AIStreamChunk> {
    const { configured, apiKey, baseUrl, model } = getAIConfig();
    if (!configured || !apiKey) {
      yield {
        type: "error",
        message: "AI provider belum dikonfigurasi di environment server.",
      };
      return;
    }

    let response: Response;
    const timeoutSignal = AbortSignal.timeout(30_000);
    const signal = request.signal
      ? AbortSignal.any([request.signal, timeoutSignal])
      : timeoutSignal;

    try {
      response = await fetch(
        `${baseUrl.replace(/\/$/, "")}/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: request.system },
              ...request.messages.map((message) => ({
                role: message.role,
                content: message.content,
              })),
            ],
            max_tokens: request.maxTokens,
            temperature: request.temperature,
            stream: true,
          }),
          signal,
        },
      );
    } catch {
      if (request.signal?.aborted) {
        yield { type: "cancelled" };
      } else {
        yield {
          type: "error",
          message: "Gagal menghubungi AI provider. Coba lagi nanti.",
        };
      }
      return;
    }

    if (!response.ok) {
      yield {
        type: "error",
        message: `AI provider mengembalikan HTTP ${response.status}. Coba lagi nanti.`,
      };
      return;
    }

    if (!response.body) {
      yield {
        type: "error",
        message: "AI provider tidak mengirim stream respons.",
      };
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const parser = new ServerSentEventParser();
    let finishReason: string | null = null;
    let doneMarker = false;
    let streamEnded = false;

    const processFrame = async function* (data: string) {
      const result = parseProviderFrame(data);
      if (result.error) {
        yield { type: "error", message: result.error } as const;
        return true;
      }
      if (result.token) {
        yield { type: "token", token: result.token } as const;
      }
      if (result.finishReason) finishReason = result.finishReason;
      if (result.done) doneMarker = true;
      return false;
    };

    try {
      while (!doneMarker) {
        const { value, done } = await reader.read();
        if (request.signal?.aborted) {
          yield { type: "cancelled" };
          return;
        }
        if (done) {
          streamEnded = true;
          break;
        }

        const text = decoder.decode(value, { stream: true });
        for (const event of parser.push(text)) {
          let failed = false;
          for await (const result of processFrame(event.data)) {
            if (result.type === "error") failed = true;
            yield result;
          }
          if (failed) return;
          if (doneMarker) break;
        }
      }

      if (streamEnded) {
        const finalText = decoder.decode();
        const finalEvents = [
          ...parser.push(finalText),
          ...parser.finish(),
        ];
        for (const event of finalEvents) {
          let failed = false;
          for await (const result of processFrame(event.data)) {
            if (result.type === "error") failed = true;
            yield result;
          }
          if (failed) return;
          if (doneMarker) break;
        }
      }

      if (finishReason) {
        yield { type: "finish", finishReason };
      } else if (doneMarker) {
        yield { type: "finish", finishReason: "stop" };
      } else {
        yield {
          type: "error",
          message: "Stream AI terputus sebelum metadata penyelesaian diterima.",
        };
      }
    } catch {
      if (request.signal?.aborted) {
        yield { type: "cancelled" };
      } else {
        yield {
          type: "error",
          message: "Stream AI terputus sebelum respons selesai.",
        };
      }
    } finally {
      if (!streamEnded && !doneMarker) {
        await reader.cancel().catch(() => undefined);
      }
      reader.releaseLock();
    }
  },
};

export function getAIProvider(): AIProvider {
  return openAIProvider;
}

export function isAIConfigured(): boolean {
  return getAIConfig().configured;
}
