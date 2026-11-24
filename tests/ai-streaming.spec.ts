import { expect, test } from "@playwright/test";

import { buildAssistantRequestMessages } from "../src/lib/ai/conversation";
import { AssistantOutputFilter } from "../src/lib/ai/output-validation";
import { ASSISTANT_SYSTEM_PROMPT } from "../src/lib/ai/prompts";
import { openAIProvider, type AIRequest } from "../src/lib/ai/provider";
import {
  consumeAssistantEventStream,
  encodeServerSentEvent,
} from "../src/lib/ai/stream-protocol";

const encoder = new TextEncoder();
const defaultRequest: AIRequest = {
  system: "Synthetic system prompt",
  messages: [{ role: "user", content: "Synthetic user message" }],
  maxTokens: 64,
  temperature: 0,
};

function providerResponse(chunks: Uint8Array[]): Response {
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk);
        controller.close();
      },
    }),
    { status: 200, headers: { "Content-Type": "text/event-stream" } },
  );
}

function providerFrame(data: unknown, suffix = "\n\n"): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(data)}${suffix}`);
}

async function collectProvider(request = defaultRequest) {
  const chunks = [];
  for await (const chunk of openAIProvider.stream(request)) chunks.push(chunk);
  return chunks;
}

function filterOutput(chunks: string[]) {
  const filter = new AssistantOutputFilter();
  let text = "";
  for (const chunk of chunks) {
    const result = filter.push(chunk);
    text += result.text;
    if (result.invalid) return { text, invalid: true };
  }
  const final = filter.finish();
  return { text: text + final.text, invalid: final.invalid };
}

function assistantResponse(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });
}

test.describe("Wise Mentor stream integrity", () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.AI_API_KEY;
  const originalBaseUrl = process.env.AI_BASE_URL;
  const originalModel = process.env.AI_MODEL;

  test.beforeEach(() => {
    process.env.AI_API_KEY = "test-key-not-a-credential";
    process.env.AI_BASE_URL = "https://provider.invalid/v1";
    process.env.AI_MODEL = "test-model";
  });

  test.afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.AI_API_KEY;
    else process.env.AI_API_KEY = originalApiKey;
    if (originalBaseUrl === undefined) delete process.env.AI_BASE_URL;
    else process.env.AI_BASE_URL = originalBaseUrl;
    if (originalModel === undefined) delete process.env.AI_MODEL;
    else process.env.AI_MODEL = originalModel;
  });

  test("preserves balanced and multiple legitimate bracket expressions", () => {
    const result = filterOutput([
      "Arus kas [Rp50.000] bisa dilihat dari kebutuhan [pokok] dan pilihan. ",
      "Target = [pengeluaran tahunan] × 25.",
    ]);

    expect(result).toEqual({
      text: "Arus kas [Rp50.000] bisa dilihat dari kebutuhan [pokok] dan pilihan. Target = [pengeluaran tahunan] × 25.",
      invalid: false,
    });
  });

  test("preserves a legitimate bracket split across streaming chunks", () => {
    const result = filterOutput(["Saldo [pengeluaran", " rutin] tetap terjaga."]);

    expect(result).toEqual({
      text: "Saldo [pengeluaran rutin] tetap terjaga.",
      invalid: false,
    });
  });

  test("flushes unclosed user-facing brackets without dropping following text", () => {
    const result = filterOutput([
      "Catatan belum lengkap [Rp50.000 tetap dapat dibahas bersama.",
    ]);

    expect(result).toEqual({
      text: "Catatan belum lengkap [Rp50.000 tetap dapat dibahas bersama.",
      invalid: false,
    });
  });

  test("detects internal annotations split across stream chunks", () => {
    const result = filterOutput([
      "Arus kas [kategorikan:",
      " kebutuhan vs keinginan]",
    ]);

    expect(result.invalid).toBe(true);
    expect(result.text).not.toContain("kategorikan");
  });

  test("detects unclosed internal instruction fragments instead of exposing them", () => {
    const result = filterOutput(["Arus kas [cari bocoran"]);

    expect(result.invalid).toBe(true);
    expect(result.text).not.toContain("cari bocoran");
  });

  test("detects placeholders split across chunks instead of exposing them", () => {
    const result = filterOutput(["Nilai {{user_", "context}} belum diisi."]);

    expect(result.invalid).toBe(true);
    expect(result.text).not.toContain("user_context");
  });

  test("detects adjacent pseudo-label annotations as an invalid response", () => {
    const result = filterOutput([
      "Uang abadi: [Aset] [hasilkan] [lebih dari belanja].",
    ]);

    expect(result.invalid).toBe(true);
    expect(result.text).not.toContain("[Aset]");
  });

  test("preserves normal Indonesian paragraphs with brackets", () => {
    const result = filterOutput([
      "Kalau pengeluaranmu Rp50.000 selama dua hari, kamu bisa mencatatnya ",
      "sebagai kebutuhan [misalnya makan] atau pilihan lain. Kita lihat polanya.",
    ]);

    expect(result).toEqual({
      text: "Kalau pengeluaranmu Rp50.000 selama dua hari, kamu bisa mencatatnya sebagai kebutuhan [misalnya makan] atau pilihan lain. Kita lihat polanya.",
      invalid: false,
    });
  });

  test("instructs the mentor to avoid pseudo-labels and unfinished fragments", () => {
    expect(ASSISTANT_SYSTEM_PROMPT).toContain("label pseudo");
    expect(ASSISTANT_SYSTEM_PROMPT).toContain("fragmen instruksi yang belum selesai");
    expect(ASSISTANT_SYSTEM_PROMPT).toContain(
      "tanyakan barang/kategori apa yang dibeli",
    );
  });

  test("parses standard SSE completion and the done marker", async () => {
    globalThis.fetch = async () =>
      providerResponse([
        providerFrame({ choices: [{ delta: { content: "Halo" } }] }),
        providerFrame({
          choices: [{ delta: {}, finish_reason: "stop" }],
        }),
        encoder.encode("data: [DONE]\n\n"),
      ]);

    expect(await collectProvider()).toEqual([
      { type: "token", token: "Halo" },
      { type: "finish", finishReason: "stop" },
    ]);
  });

  test("processes a final provider frame without a trailing newline", async () => {
    globalThis.fetch = async () =>
      providerResponse([
        providerFrame(
          { choices: [{ delta: { content: "selesai" } }] },
        ),
        providerFrame(
          { choices: [{ delta: {}, finish_reason: "stop" }] },
          "",
        ),
      ]);

    expect(await collectProvider()).toEqual([
      { type: "token", token: "selesai" },
      { type: "finish", finishReason: "stop" },
    ]);
  });

  test("accepts EOF with finish_reason stop and no done marker", async () => {
    globalThis.fetch = async () =>
      providerResponse([
        providerFrame({ choices: [{ delta: { content: "Tuntas 🌱" } }] }),
        providerFrame({
          choices: [{ delta: {}, finish_reason: "stop" }],
        }),
      ]);

    expect(await collectProvider()).toEqual([
      { type: "token", token: "Tuntas 🌱" },
      { type: "finish", finishReason: "stop" },
    ]);
  });

  test("preserves UTF-8 characters split across provider byte chunks", async () => {
    const bytes = encoder.encode(
      `data: ${JSON.stringify({ choices: [{ delta: { content: "Hai 🌱" } }] })}\n\n`,
    );
    const emoji = encoder.encode("🌱");
    let splitAt = -1;
    for (let index = 0; index <= bytes.length - emoji.length; index += 1) {
      if (emoji.every((byte, offset) => bytes[index + offset] === byte)) {
        splitAt = index + 1;
        break;
      }
    }

    globalThis.fetch = async () =>
      providerResponse([
        bytes.slice(0, splitAt),
        bytes.slice(splitAt),
        providerFrame({
          choices: [{ delta: {}, finish_reason: "stop" }],
        }),
      ]);

    expect(await collectProvider()).toEqual([
      { type: "token", token: "Hai 🌱" },
      { type: "finish", finishReason: "stop" },
    ]);
  });

  test("preserves finish_reason length for the route to report as incomplete", async () => {
    globalThis.fetch = async () =>
      providerResponse([
        providerFrame({
          choices: [{ delta: { content: "Belum selesai" } }],
        }),
        providerFrame({
          choices: [{ delta: {}, finish_reason: "length" }],
        }),
      ]);

    expect(await collectProvider()).toEqual([
      { type: "token", token: "Belum selesai" },
      { type: "finish", finishReason: "length" },
    ]);
  });

  test("returns sanitized provider errors without raw error details", async () => {
    globalThis.fetch = async () =>
      providerResponse([
        providerFrame({
          error: {
            code: "rate_limit_exceeded",
            message: "private raw provider detail",
          },
        }),
      ]);

    const result = await collectProvider();
    expect(result).toEqual([
      {
        type: "error",
        message:
          "AI provider menghentikan respons (rate_limit_exceeded). Coba lagi nanti.",
      },
    ]);
    expect(JSON.stringify(result)).not.toContain("private raw provider detail");
  });

  test("reports non-success provider HTTP status without exposing its body", async () => {
    globalThis.fetch = async () =>
      new Response("private raw provider detail", { status: 503 });

    const result = await collectProvider();
    expect(result).toEqual([
      {
        type: "error",
        message: "AI provider mengembalikan HTTP 503. Coba lagi nanti.",
      },
    ]);
    expect(JSON.stringify(result)).not.toContain("private raw provider detail");
  });

  test("treats EOF without a finish reason as unexpected", async () => {
    globalThis.fetch = async () =>
      providerResponse([
        providerFrame({ choices: [{ delta: { content: "Parsial" } }] }),
      ]);

    expect(await collectProvider()).toEqual([
      { type: "token", token: "Parsial" },
      {
        type: "error",
        message: "Stream AI terputus sebelum metadata penyelesaian diterima.",
      },
    ]);
  });

  test("propagates cancellation to the provider stream", async () => {
    let upstreamSignal: AbortSignal | null = null;
    globalThis.fetch = async (_input, init) => {
      upstreamSignal = init?.signal as AbortSignal;
      return new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(
              providerFrame({
                choices: [{ delta: { content: "Sebagian" } }],
              }),
            );
            upstreamSignal?.addEventListener(
              "abort",
              () => controller.error(new DOMException("Aborted", "AbortError")),
              { once: true },
            );
          },
        }),
        { status: 200 },
      );
    };

    const abortController = new AbortController();
    const iterator = openAIProvider
      .stream({ ...defaultRequest, signal: abortController.signal })
      [Symbol.asyncIterator]();

    expect((await iterator.next()).value).toEqual({
      type: "token",
      token: "Sebagian",
    });
    abortController.abort();
    expect((await iterator.next()).value).toEqual({ type: "cancelled" });
    await iterator.return?.();
  });

  test("renders complete UTF-8 text and consumes the final SSE frame at EOF", async () => {
    const text = "Pengeluaran [Rp50.000] 🌱 selama dua hari.";
    const frames = [
      encodeServerSentEvent("delta", { text }),
      encodeServerSentEvent("complete", { finishReason: "stop" }).trimEnd(),
    ];
    const bytes = encoder.encode(frames.join(""));
    const split = bytes.indexOf(0xf0) + 2;
    const seen: string[] = [];

    await expect(
      consumeAssistantEventStream(
        assistantResponse([bytes.slice(0, split), bytes.slice(split)]),
        (chunk) => seen.push(chunk),
      ),
    ).resolves.toEqual({ finishReason: "stop" });
    expect(seen.join("")).toBe(text);
  });

  test("surfaces provider errors and unexpected frontend EOF", async () => {
    const providerError = encoder.encode(
      encodeServerSentEvent("error", { message: "Provider tidak tersedia." }),
    );
    await expect(
      consumeAssistantEventStream(
        assistantResponse([providerError]),
        () => undefined,
      ),
    ).rejects.toThrow("Provider tidak tersedia.");

    await expect(
      consumeAssistantEventStream(
        assistantResponse([
          encoder.encode(encodeServerSentEvent("delta", { text: "parsial" })),
        ]),
        () => undefined,
      ),
    ).rejects.toThrow("Respons terputus sebelum dinyatakan selesai.");
  });

  test("marks frontend stream cancellation as AbortError", async () => {
    const abortController = new AbortController();
    const pending = consumeAssistantEventStream(
      new ReadableStream<Uint8Array>(),
      () => undefined,
      abortController.signal,
    );
    abortController.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });

  test("keeps the latest user message once and excludes unsaved responses", () => {
    const history = [
      { role: "user" as const, content: "financial independence" },
      { role: "assistant" as const, content: "cash flow explanation" },
      {
        role: "assistant" as const,
        content: "not persisted",
        deliveryStatus: "not-saved" as const,
      },
    ];

    const request = buildAssistantRequestMessages(
      history,
      "I spent Rp50.000 in two days.",
    );

    expect(request).toEqual([
      { role: "user", content: "financial independence" },
      { role: "assistant", content: "cash flow explanation" },
      { role: "user", content: "I spent Rp50.000 in two days." },
    ]);
    expect(
      request.filter(
        (message) => message.content === "I spent Rp50.000 in two days.",
      ),
    ).toHaveLength(1);
  });

  test("caps request context at 20 messages without reordering the latest turn", () => {
    const history = Array.from({ length: 25 }, (_, index) => ({
      role: index % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `saved-${index}`,
    }));

    const request = buildAssistantRequestMessages(history, "latest");

    expect(request).toHaveLength(20);
    expect(request[0].content).toBe("saved-6");
    expect(request[18].content).toBe("saved-24");
    expect(request[19]).toEqual({ role: "user", content: "latest" });
  });
});
