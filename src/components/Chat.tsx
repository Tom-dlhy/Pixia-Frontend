"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Paperclip } from "lucide-react";
import { ChatInput } from "~/components/ChatInput";
import { sendChatMessage } from "../server/chat.server";
import { useAppSession } from "~/utils/session";

// ----------------------
// 🔹 Types
// ----------------------
export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
  attachments?: Array<{ name: string; size: number }>;
};

const STORAGE_KEY = "chat:conversations";
const MOCK_CHAT_ID = "test-session";

// ----------------------
// 🔹 Helpers
// ----------------------
function loadConversation(id: string): ChatMessage[] | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data) as Record<string, ChatMessage[]>;
    return parsed[id] ?? null;
  } catch {
    return null;
  }
}

function saveConversation(id: string, messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? (JSON.parse(data) as Record<string, ChatMessage[]>) : {};
    parsed[id] = messages;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {}
}

// ----------------------
// 🔹 Component
// ----------------------
export function Chat({
  initialMessages = [],
  chatId: propChatId,
  onFirstMessage,
}: {
  initialMessages?: ChatMessage[];
  chatId?: string;
  onFirstMessage?: () => void;
}) {
  const { session } = useAppSession();
  const userId = session.googleSub ?? (session.userId != null ? String(session.userId) : "anonymous-user");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);

  const listRef = useRef<HTMLDivElement | null>(null);
  const chatIdRef = useRef<string | null>(propChatId ?? null);
  const hasLoadedRef = useRef(false);

  // ----------------------
  // 🔹 Scroll automatique
  // ----------------------
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  // ----------------------
  // 🔹 Chargement unique de la conversation
  // ----------------------
  useEffect(() => {
    if (hasLoadedRef.current) return; // ✅ Empêche les boucles infinies
    hasLoadedRef.current = true;

    const id = propChatId ?? MOCK_CHAT_ID;
    chatIdRef.current = propChatId ?? null;

    const stored = loadConversation(id);
    if (stored && stored.length) {
      setMessages(stored);
    } else if (initialMessages.length) {
      saveConversation(id, initialMessages);
      setMessages(initialMessages);
    }
  }, [propChatId, initialMessages]);

  // ----------------------
  // 🔹 Envoi d’un message
  // ----------------------
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const isFirstMessage = messages.length === 0;
    setSending(true);
    setError(null);

    const currentChatId = chatIdRef.current;

    try {
      const res = await sendChatMessage({
        data: {
          user_id: userId,
          chatId: currentChatId,
          message: input,
        },
      });

      const newMessages: ChatMessage[] = [
        ...messages,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: input,
          createdAt: Date.now(),
        },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: res.reply,
          createdAt: Date.now(),
        },
      ];

      setMessages(newMessages);
      saveConversation(chatIdRef.current ?? MOCK_CHAT_ID, newMessages);

      if (!chatIdRef.current && res.session_id) {
        chatIdRef.current = res.session_id;
      }

      if (isFirstMessage && onFirstMessage) {
        onFirstMessage();
      }
    } catch (err) {
      console.error("Erreur lors de l’envoi :", err);
      setError("Une erreur est survenue lors de l’envoi du message.");
    } finally {
      setInput("");
      setSending(false);
    }
  }, [input, messages, onFirstMessage]);

  // ----------------------
  // 🔹 Gestion des fichiers
  // ----------------------
  const handleFilesSelected = (files: File[]) => {
    if (files.length) setQueuedFiles(files);
  };

  const removeAttachment = (index: number) => {
    setQueuedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ----------------------
  // 🔹 Render
  // ----------------------
  return (
    <div className="flex h-full flex-col bg-transparent text-sidebar-foreground">
      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`rounded-2xl px-4 py-2 max-w-[75%] text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-blue-500 text-white dark:bg-blue-600"
                  : "bg-muted/60 dark:bg-muted/40 text-foreground"
              }`}
            >
              {m.content}
              {m.attachments?.length ? (
                <div className="mt-3 flex flex-wrap gap-2 text-xs opacity-80">
                  {m.attachments.map((file) => (
                    <span
                      key={`${m.id}-${file.name}`}
                      className="inline-flex items-center gap-1 rounded-full bg-black/20 px-2 py-1 text-[11px] dark:bg-white/10"
                    >
                      <Paperclip className="h-3 w-3" />
                      <span className="max-w-[140px] truncate">{file.name}</span>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {sending && (
          <div className="px-4 text-xs italic text-muted-foreground">
            L’assistant est en train d’écrire…
          </div>
        )}
        {error && (
          <div className="px-4 text-xs text-red-500 italic">{error}</div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 z-20 flex w-full justify-center px-4">
        <div className="w-full max-w-3xl">
          <ChatInput
            className="w-full"
            value={input}
            onChange={setInput}
            onSubmit={handleSend}
            onFilesSelected={handleFilesSelected}
            queuedFiles={queuedFiles}
            onRemoveAttachment={removeAttachment}
            isSending={sending}
          />
        </div>
      </div>
    </div>
  );
}
