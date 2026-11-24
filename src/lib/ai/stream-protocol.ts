export type AssistantStreamEvent =
  | { type: "delta"; text: string }
  | { type: "complete"; finishReason: string }
  | { type: "error"; message: string };

export type ServerSentEvent = {
  event: string;
  data: string;
};

export function encodeServerSentEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export class ServerSentEventParser {
  private buffer = "";

  push(text: string): ServerSentEvent[] {
    this.buffer += text;
    const events: ServerSentEvent[] = [];

    while (true) {
      const boundary = this.buffer.match(/\r?\n\r?\n/);
      if (!boundary || boundary.index === undefined) break;
      const frame = this.buffer.slice(0, boundary.index);
      this.buffer = this.buffer.slice(boundary.index + boundary[0].length);
      const event = this.parseFrame(frame);
      if (event) events.push(event);
    }

    return events;
  }

  finish(): ServerSentEvent[] {
    if (!this.buffer.trim()) {
      this.buffer = "";
      return [];
    }

    const event = this.parseFrame(this.buffer);
    this.buffer = "";
    return event ? [event] : [];
  }

  private parseFrame(frame: string): ServerSentEvent | null {
    let event = "message";
    const data: string[] = [];

    for (const line of frame.split(/\r?\n/)) {
      if (!line || line.startsWith(":")) continue;
      const separator = line.indexOf(":");
      const field = separator < 0 ? line : line.slice(0, separator);
      const value = separator < 0 ? "" : line.slice(separator + 1).replace(/^ /, "");

      if (field === "event") event = value;
      if (field === "data") data.push(value);
    }

    return data.length > 0 ? { event, data: data.join("\n") } : null;
  }
}

export function parseAssistantStreamEvent(
  event: ServerSentEvent,
): AssistantStreamEvent {
  let payload: unknown;
  try {
    payload = JSON.parse(event.data);
  } catch {
    throw new Error("Format stream respons tidak valid.");
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Format stream respons tidak valid.");
  }

  const record = payload as Record<string, unknown>;
  if (event.event === "delta" && typeof record.text === "string") {
    return { type: "delta", text: record.text };
  }
  if (event.event === "complete" && typeof record.finishReason === "string") {
    return { type: "complete", finishReason: record.finishReason };
  }
  if (event.event === "error" && typeof record.message === "string") {
    return { type: "error", message: record.message };
  }

  throw new Error("Jenis stream respons tidak dikenal.");
}

export async function consumeAssistantEventStream(
  body: ReadableStream<Uint8Array>,
  onText: (text: string) => void,
  signal?: AbortSignal,
): Promise<{ finishReason: string }> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const parser = new ServerSentEventParser();
  let finishReason: string | null = null;
  let readerCancelled = false;
  let completed = false;

  const cancelReader = () => {
    readerCancelled = true;
    void reader.cancel(signal?.reason).catch(() => undefined);
  };

  const processEvents = (events: ServerSentEvent[]) => {
    for (const rawEvent of events) {
      const event = parseAssistantStreamEvent(rawEvent);
      if (event.type === "delta") {
        if (finishReason !== null) {
          throw new Error("Stream mengirim teks setelah dinyatakan selesai.");
        }
        onText(event.text);
      } else if (event.type === "complete") {
        if (finishReason !== null) {
          throw new Error("Stream mengirim lebih dari satu sinyal selesai.");
        }
        finishReason = event.finishReason;
      } else {
        throw new Error(event.message);
      }
    }
  };

  if (signal?.aborted) {
    throw new DOMException("Generasi dihentikan.", "AbortError");
  }

  signal?.addEventListener("abort", cancelReader, { once: true });

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (signal?.aborted) {
        throw new DOMException("Generasi dihentikan.", "AbortError");
      }
      if (done) break;
      processEvents(parser.push(decoder.decode(value, { stream: true })));
    }

    processEvents(parser.push(decoder.decode()));
    processEvents(parser.finish());

    if (finishReason === null) {
      throw new Error("Respons terputus sebelum dinyatakan selesai.");
    }

    completed = true;
    return { finishReason };
  } catch (error) {
    if (signal?.aborted) {
      throw new DOMException("Generasi dihentikan.", "AbortError");
    }
    throw error;
  } finally {
    signal?.removeEventListener("abort", cancelReader);
    if (!completed && !readerCancelled) {
      await reader.cancel().catch(() => undefined);
    }
    if (!readerCancelled) reader.releaseLock();
  }
}
