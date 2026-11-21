/**
 * AI provider abstraction for PERINTIS Personal Assistant.
 *
 * Provider is configured server-side via:
 *   AI_API_KEY
 *   AI_BASE_URL
 *   AI_MODEL
 *
 * No API key is ever exposed to the client bundle.
 * If AI_API_KEY is missing, the app builds normally and the
 * assistant page shows a clear configuration message.
 */

export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AIRequest = {
  system: string;
  messages: AIMessage[];
  maxTokens: number;
  temperature: number;
};

export type AIStreamChunk = {
  token?: string;
  error?: string;
};

export interface AIProvider {
  stream(request: AIRequest): AsyncIterable<AIStreamChunk>;
}

function getAIConfig() {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    return { configured: false, apiKey, baseUrl, model };
  }
  return { configured: true, apiKey, baseUrl, model };
}

/**
 * OpenAI-compatible streaming provider.
 * Uses fetch + ReadableStream to parse SSE chunks.
 * Never throws; returns error chunks instead.
 */
export const openAIProvider: AIProvider = {
  async *stream(request: AIRequest): AsyncIterable<AIStreamChunk> {
    const { configured, apiKey, baseUrl, model } = getAIConfig();
    if (!configured) {
      yield { error: "AI provider not configured. Set AI_API_KEY on the server." };
      return;
    }

    let response: Response;
    try {
      response = await fetch(baseUrl.replace(/\/$/, "") + "/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: request.system },
            ...request.messages.map((m) => ({ role: m.role, content: m.content })),
          ],
          max_tokens: request.maxTokens,
          temperature: request.temperature,
          stream: true,
        }),
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      yield { error: "Gagal menghubungi AI provider. Cek koneksi atau coba lagi nanti." };
      return;
    }

    if (!response.ok) {
      yield { error: "AI provider tidak merespons. Silakan coba lagi." };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield { error: "AI provider mengembalikan respon kosong." };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (readerDone) {
        done = true;
        break;
      }
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") {
          done = true;
          break;
        }
        try {
          const json = JSON.parse(payload);
          const token = json.choices?.[0]?.delta?.content;
          if (token) yield { token };
        } catch {
          // Ignore malformed SSE line.
        }
      }
    }
  },
};

export function getAIProvider(): AIProvider {
  return openAIProvider;
}

export function isAIConfigured(): boolean {
  return getAIConfig().configured;
}