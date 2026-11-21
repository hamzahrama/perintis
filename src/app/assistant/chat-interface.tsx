"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Notice, TextInput } from "@/components/ui";
import { SUGGESTED_PROMPTS } from "@/lib/ai/prompts";
import { createConversationAction, saveMessageAction } from "./actions";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Conversation = {
  id: string;
  title: string;
  updated_at: string;
};

export function ChatInterface({ 
  initialConversations,
  isConfigured 
}: { 
  initialConversations: Conversation[],
  isConfigured: boolean
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load messages when conversation changes
  useEffect(() => {
    if (activeId) {
      // In a real app, we'd fetch from Supabase here.
      // For Phase 1, we'll keep it simple or just start new.
    }
  }, [activeId]);

  async function handleSendMessage(text: string) {
    if (!text.trim() || isLoading || !isConfigured) return;

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    let currentConversationId = activeId;

    try {
      // 1. Create conversation if none active
      if (!currentConversationId) {
        const result = await createConversationAction(new FormData());
        if (result.error || !result.data) {
          throw new Error(result.error || "Gagal membuat percakapan");
        }
        currentConversationId = result.data.id;
        setActiveId(currentConversationId);
        setConversations([result.data, ...conversations]);
      }

      if (!currentConversationId) {
        throw new Error("Percakapan tidak ditemukan");
      }

      // 2. Save user message to DB
      await saveMessageAction(currentConversationId, "user", text);

      // 3. Request streaming response from AI
      const response = await fetch("/api/assistant", {
        method: "POST",
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gagal menghubungi assistant");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Gagal membaca respon streaming");

      let assistantContent = "";
      setMessages([...newMessages, { role: "assistant", content: "" }]);

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        assistantContent += chunk;
        
        setMessages([...newMessages, { role: "assistant", content: assistantContent }]);
      }

      // 4. Save assistant message to DB
      await saveMessageAction(currentConversationId, "assistant", assistantContent);

    } catch {
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="assistant-layout">
      {/* Sidebar - Desktop */}
      <aside className="assistant-sidebar">
        <Button 
          variant="secondary" 
          className="w-full mb-4"
          onClick={() => {
            setActiveId(null);
            setMessages([]);
          }}
        >
          + Percakapan Baru
        </Button>
        <div className="conversation-list">
          {conversations.map((c) => (
            <button
              key={c.id}
              className={`conversation-item ${activeId === c.id ? 'active' : ''}`}
              onClick={() => setActiveId(c.id)}
            >
              <span className="title">{c.title}</span>
              <span className="date">{new Date(c.updated_at).toLocaleDateString()}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat Area */}
      <section className="assistant-chat">
        <div className="messages-container" ref={scrollRef}>
          {messages.length === 0 ? (
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
            messages.map((m, i) => (
              <div key={i} className={`message-bubble ${m.role}`}>
                <div className="avatar">{m.role === 'user' ? '👤' : '🌱'}</div>
                <div className="content">{m.content}</div>
              </div>
            ))
          )}
          {isLoading && !messages.find(m => m.role === 'assistant' && m.content) && (
            <div className="message-bubble assistant">
              <div className="avatar">🌱</div>
              <div className="content loading-dots">Mengetik<span>.</span><span>.</span><span>.</span></div>
            </div>
          )}
          {error && <Notice tone="error" className="m-4">{error}</Notice>}
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
            placeholder="Ketik pesan..."
            disabled={!isConfigured || isLoading}
            autoFocus
          />
          <Button type="submit" disabled={!isConfigured || isLoading || !input.trim()}>
            Kirim
          </Button>
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

        .conversation-item {
          display: flex;
          flex-direction: column;
          text-align: left;
          padding: 0.75rem;
          border-radius: var(--radius-md);
          margin-bottom: 0.5rem;
          transition: background 0.2s;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
        }

        .conversation-item:hover {
          background: var(--color-surface-hover);
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

        .prompt-chip {
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          border: 1px solid var(--color-border);
          background: transparent;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .prompt-chip:hover {
          background: var(--color-surface-hover);
          border-color: var(--color-primary);
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

        @media (max-width: 768px) {
          .assistant-layout {
            grid-template-columns: 1fr;
          }
          .assistant-sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
