"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button, Notice, TextInput } from "@/components/ui";
import { SUGGESTED_PROMPTS, getSuggestedFollowups } from "@/lib/ai/prompts";
import { buildAssistantRequestMessages } from "@/lib/ai/conversation";
import { consumeAssistantEventStream } from "@/lib/ai/stream-protocol";
import {
  createConversationAction,
  deleteConversationAction,
  saveMessageAction,
  getConversationMessagesAction,
} from "./actions";

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
  deliveryStatus?: "interrupted" | "not-saved";
};

type Conversation = {
  id: string;
  title: string;
  updated_at: string;
};

export function ChatInterface({
  initialConversations,
  isConfigured,
}: {
  initialConversations: Conversation[];
  isConfigured: boolean;
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const loadConversation = useCallback(async (id: string) => {
    setIsLoadingHistory(true);
    setError(null);
    try {
      const result = await getConversationMessagesAction(id);
      if (result.error) throw new Error(result.error);
      setMessages((result.data as Message[]) || []);
      setActiveId(id);
    } catch {
      setError("Gagal memuat riwayat percakapan.");
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const handleNewConversation = () => {
    setActiveId(null);
    setMessages([]);
    setError(null);
    setDeleteConfirm(null);
  };

  const handleDeleteConversation = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }
    setError(null);
    try {
      const result = await deleteConversationAction(id);
      if (result.error) throw new Error(result.error);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) {
        handleNewConversation();
      }
    } catch {
      setError("Gagal menghapus percakapan.");
    } finally {
      setDeleteConfirm(null);
    }
  };

  async function handleSendMessage(text: string) {
    if (!text.trim() || isLoading || !isConfigured) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    let currentConversationId = activeId;
    let assistantContent = "";
    let assistantMessageId: string | null = null;
    let assistantStarted = false;
    let assistantCompleted = false;

    try {
      if (!currentConversationId) {
        const result = await createConversationAction(new FormData());
        if (result.error || !result.data) {
          throw new Error(result.error || "Gagal membuat percakapan");
        }
        currentConversationId = result.data.id;
        setActiveId(currentConversationId);
        const newConversation = result.data;
        setConversations((previous) => [
          newConversation,
          ...previous.filter(
            (conversation) => conversation.id !== newConversation.id,
          ),
        ]);
      }

      if (!currentConversationId) {
        throw new Error("Percakapan tidak ditemukan");
      }

      let savedUserMessage;
      try {
        savedUserMessage = await saveMessageAction(
          currentConversationId,
          "user",
          text,
        );
      } catch {
        setMessages((current) =>
          current.map((message) =>
            message.id === userMessage.id
              ? { ...message, deliveryStatus: "not-saved" }
              : message,
          ),
        );
        throw new Error("Pesan pengguna gagal disimpan. Coba kirim ulang.");
      }
      if (savedUserMessage.error || !savedUserMessage.success) {
        setMessages((current) =>
          current.map((message) =>
            message.id === userMessage.id
              ? { ...message, deliveryStatus: "not-saved" }
              : message,
          ),
        );
        throw new Error(
          savedUserMessage.error || "Pesan pengguna gagal disimpan.",
        );
      }

      const requestMessages = buildAssistantRequestMessages(messages, text);
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: requestMessages }),
        signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          const retry = errData.retryAfter ?? 60;
          throw new Error(`Batas permintaan tercapai. Coba lagi dalam ${Math.ceil(retry)} detik.`);
        }
        throw new Error(errData.error || "Gagal menghubungi assistant");
      }

      if (!response.body) throw new Error("Gagal membaca respon streaming");

      assistantStarted = true;
      assistantMessageId = crypto.randomUUID();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      };
      setMessages([...newMessages, assistantMessage]);

      await consumeAssistantEventStream(
        response.body,
        (textChunk) => {
          assistantContent += textChunk;
          setMessages([
            ...newMessages,
            { ...assistantMessage, content: assistantContent },
          ]);
        },
        signal,
      );
      assistantCompleted = true;

      let savedAssistantMessage;
      try {
        savedAssistantMessage = await saveMessageAction(
          currentConversationId,
          "assistant",
          assistantContent,
        );
      } catch {
        setMessages([
          ...newMessages,
          {
            ...assistantMessage,
            content: assistantContent,
            deliveryStatus: "not-saved",
          },
        ]);
        setError(
          "Jawaban selesai, tetapi gagal disimpan. Jawaban ini tidak akan dipakai sebagai riwayat pada pesan berikutnya.",
        );
        return;
      }
      if (savedAssistantMessage.error || !savedAssistantMessage.success) {
        setMessages([
          ...newMessages,
          {
            ...assistantMessage,
            content: assistantContent,
            deliveryStatus: "not-saved",
          },
        ]);
        setError(
          savedAssistantMessage.error ||
            "Jawaban selesai, tetapi gagal disimpan. Jawaban ini tidak akan dipakai sebagai riwayat pada pesan berikutnya.",
        );
      }

    } catch (err: unknown) {
      const wasCancelled =
        err instanceof DOMException && err.name === "AbortError";
      if (assistantStarted && assistantMessageId) {
        setMessages([
          ...newMessages,
          {
            id: assistantMessageId,
            role: "assistant",
            content: assistantContent,
            deliveryStatus: assistantCompleted ? "not-saved" : "interrupted",
          },
        ]);
      }
      const msg = wasCancelled
        ? "Generasi dihentikan. Jawaban terputus dan belum disimpan."
        : assistantCompleted
          ? "Jawaban selesai, tetapi gagal disimpan. Jawaban ini tidak akan dipakai sebagai riwayat pada pesan berikutnya."
        : err instanceof Error
          ? err.message
          : "Terjadi kesalahan. Silakan coba lagi.";
      setError(msg);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }

  const handleStop = () => {
    if (abortRef.current) {
      setError("Menghentikan generasi...");
      abortRef.current.abort();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const lastUserMsg = messages.length > 0
    ? [...messages].reverse().find((m) => m.role === "user")?.content ?? ""
    : "";
  const lastAssistantMsg = messages.length > 0
    ? [...messages].reverse().find((m) => m.role === "assistant")?.content ?? ""
    : "";
  const followups = getSuggestedFollowups({ lastUserMessage: lastUserMsg, lastAssistantMessage: lastAssistantMsg });

  const showFollowups = () =>
    !isLoading &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    !messages[messages.length - 1].deliveryStatus &&
    followups.length > 0;

  return (
    <div className="assistant-layout">
      <aside className={`assistant-sidebar${mobileDrawerOpen ? " assistant-sidebar--open" : ""}`}>
        <Button
          variant="secondary"
          className="w-full mb-4"
          onClick={() => {
            handleNewConversation();
            setMobileDrawerOpen(false);
          }}
          disabled={isLoading}
        >
          + Percakapan Baru
        </Button>
        <div className="conversation-list">
          {conversations.length === 0 ? (
            <p className="conversation-empty">Belum ada percakapan</p>
          ) : (
            conversations.map((c) => (
              <div key={c.id} className="conversation-row">
                <button
                  className={`conversation-item ${activeId === c.id ? "active" : ""}`}
                  onClick={() => {
                    loadConversation(c.id);
                    setMobileDrawerOpen(false);
                  }}
                  disabled={isLoading}
                >
                  <span className="title">{c.title}</span>
                  <span className="date">{new Date(c.updated_at).toLocaleDateString()}</span>
                </button>
                <button
                  className={`button button--ghost button--sm ${deleteConfirm === c.id ? "delete-confirm" : ""}`}
                  onClick={() => handleDeleteConversation(c.id)}
                  disabled={isLoading || deleteConfirm === c.id}
                  aria-label={deleteConfirm === c.id ? "Konfirmasi hapus" : "Hapus percakapan"}
                >
                  {deleteConfirm === c.id ? "✓" : "🗑"}
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
      {mobileDrawerOpen && (
        <div
          className="assistant-overlay"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
      <Button
        className="assistant-mobile-toggle"
        variant="secondary"
        onClick={() => setMobileDrawerOpen((prev) => !prev)}
        aria-expanded={mobileDrawerOpen}
        aria-controls="assistant-sidebar"
      >
        {mobileDrawerOpen ? "Tutup" : "Riwayat Percakapan"}
      </Button>

      <section className="assistant-chat">
        <div className="messages-container" ref={scrollRef}>
          {isLoadingHistory ? (
            <div className="loading-history">Memuat riwayat...</div>
          ) : messages.length === 0 ? (
            <div className="empty-chat">
              <div className="assistant-avatar">🌱</div>
              <h2>Ada yang bisa aku bantu hari ini?</h2>
              <p>Aku memahami goals dan jadwalmu. Coba tanya sesuatu:</p>
              <div className="suggested-prompts">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    className="prompt-chip"
                    onClick={() => handleSendMessage(prompt)}
                    disabled={!isConfigured || isLoading}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <div key={m.id ?? i} className={`message-bubble ${m.role}`}>
                  <div className="avatar">{m.role === "user" ? "👤" : "🌱"}</div>
                  <div className="content">
                    {m.content}
                    {m.deliveryStatus === "interrupted" && (
                      <p className="message-status">
                        Respons terputus dan belum disimpan.
                      </p>
                    )}
                    {m.deliveryStatus === "not-saved" && (
                      <p className="message-status">
                        Pesan ini belum tersimpan dan tidak dipakai sebagai riwayat.
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {showFollowups() && (
                <div className="suggested-followups">
                  <p className="followup-label">Lanjutkan obrolan:</p>
                  <div className="suggested-prompts suggested-prompts--inline">
                    {followups.map((prompt) => (
                      <button
                        key={prompt}
                        className="prompt-chip"
                        onClick={() => handleSendMessage(prompt)}
                        disabled={!isConfigured || isLoading}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          {isLoading && (
            <div className="message-bubble assistant">
              <div className="avatar">🌱</div>
              <div className="content loading-dots">Mengetik<span>.</span><span>.</span><span>.</span></div>
            </div>
          )}
          {error && (
            <Notice tone="error" className="m-4" role="alert">
              {error}
              {isLoading && (
                <Button variant="secondary" onClick={handleStop} className="ml-2">
                  Hentikan
                </Button>
              )}
            </Notice>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          className="input-area"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
        >
          <TextInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan... (Shift+Enter untuk baris baru)"
            disabled={!isConfigured || isLoading}
            autoFocus
          />
          {isLoading ? (
            <Button type="button" variant="secondary" onClick={handleStop}>
              Hentikan
            </Button>
          ) : (
            <Button type="submit" disabled={!isConfigured || !input.trim()}>
              Kirim
            </Button>
          )}
        </form>
      </section>

      <style jsx global>{`
        .assistant-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 1.5rem;
          height: calc(100vh - 200px);
          min-height: 500px;
        }

        .assistant-sidebar {
          border-right: 1px solid var(--color-border);
          padding-right: 1rem;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .conversation-empty {
          padding: 1rem;
          font-size: 0.85rem;
          color: var(--color-text-muted);
          text-align: center;
        }

        .conversation-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .conversation-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          text-align: left;
          padding: 0.75rem;
          border-radius: var(--radius-md);
          transition: background 0.2s;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
        }

        .conversation-item:hover {
          background: var(--color-surface-hover);
        }

        .conversation-item:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .conversation-item.active {
          background: var(--color-surface-selected);
          border-color: var(--color-primary);
        }

        .conversation-item .title {
          font-weight: 500;
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .conversation-item .date {
          font-size: 0.75rem;
          opacity: 0.6;
        }

        .assistant-chat {
          display: flex;
          flex-direction: column;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          overflow: hidden;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .message-bubble {
          display: flex;
          gap: 1rem;
          max-width: 85%;
        }

        .message-bubble.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message-bubble .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-surface-muted);
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .message-bubble .content {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-lg);
          background: var(--color-surface-muted);
          font-size: 0.95rem;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .message-status {
          margin-top: 0.5rem;
          color: var(--color-text-muted);
          font-size: 0.75rem;
        }

        .message-bubble.user .content {
          background: var(--color-primary);
          color: white;
        }

        .empty-chat {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          padding: 2rem;
        }

        .assistant-avatar {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .suggested-prompts {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
          margin-top: 1.5rem;
          max-width: 500px;
        }

        .suggested-prompts--inline {
          justify-content: flex-start;
          margin-top: 0.5rem;
          max-width: 100%;
        }

        .prompt-chip {
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--color-text);
        }

        .prompt-chip:hover {
          background: var(--color-surface-hover);
          border-color: var(--color-primary);
          transform: translateY(-1px);
        }

        .prompt-chip--primary {
          border-color: var(--color-primary);
          color: var(--color-primary);
          font-weight: 500;
        }

        .suggested-followups {
          margin-top: -0.5rem;
          padding-left: 2.75rem;
          animation: fadeIn 0.3s ease-out;
        }

        .followup-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-bottom: 0.25rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .prompt-chip:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .input-area {
          padding: 1rem;
          border-top: 1px solid var(--color-border);
          display: flex;
          gap: 0.75rem;
        }

        .loading-dots span {
          animation: blink 1.4s infinite both;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }

        .loading-history {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--color-text-muted);
        }

        @media (max-width: 768px) {
          .assistant-layout {
            grid-template-columns: 1fr;
          }
          .assistant-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: 280px;
            max-width: 85vw;
            background: var(--color-surface);
            border-right: 1px solid var(--color-border);
            z-index: 50;
            transform: translateX(-100%);
            transition: transform 0.2s ease;
            box-shadow: var(--shadow-lg);
            padding: 1.5rem 1rem 1rem;
            padding-right: 1rem;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
          }
          .assistant-sidebar.assistant-sidebar--open {
            transform: translateX(0);
          }
          .assistant-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            z-index: 40;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s ease, visibility 0.2s ease;
          }
          .assistant-overlay:not([hidden]) {
            opacity: 1;
            visibility: visible;
          }
          .assistant-mobile-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 140px;
          }
          .assistant-chat {
            border-radius: var(--radius-lg);
            border-top-left-radius: 0;
            border-top-right-radius: 0;
          }
        }
        @media (min-width: 769px) {
          .assistant-mobile-toggle {
            display: none;
          }
          .assistant-overlay {
            display: none;
          }
        }
        .delete-confirm {
          color: var(--color-error);
          border-color: var(--color-error);
        }
      `}</style>
    </div>
  );
}