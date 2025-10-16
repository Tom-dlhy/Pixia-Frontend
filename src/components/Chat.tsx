"use client"

import { useEffect, useRef, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Paperclip } from "lucide-react"
import { ChatInput } from "~/components/ChatInput"

export type ChatMessage = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: number
  attachments?: Array<{ name: string; size: number }>
}

const STORAGE_KEY = "chat:conversations"
const MOCK_CHAT_ID = "test"

function loadConversation(id: string): ChatMessage[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, ChatMessage[]>
    return Array.isArray(parsed[id]) ? parsed[id] : null
  } catch (error) {
    console.warn("Failed to parse conversations", error)
    return null
  }
}

function saveConversation(id: string, messages: ChatMessage[]) {
  if (typeof window === "undefined") return
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Record<string, ChatMessage[]>) : {}
    parsed[id] = messages
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
  } catch (error) {
    console.warn("Failed to persist conversation", error)
  }
}

export function Chat({
  initialMessages = [],
  chatId,
}: {
  initialMessages?: ChatMessage[]
  chatId?: string
}) {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [queuedFiles, setQueuedFiles] = useState<File[]>([])
  const listRef = useRef<HTMLDivElement | null>(null)
  const chatIdRef = useRef<string | undefined>(chatId)
  const isMountedRef = useRef(true)

  // Scroll auto vers le bas quand un message est ajouté
  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    chatIdRef.current = chatId
    if (!chatId) return
    const stored = loadConversation(chatId)
    if (stored) {
      setMessages(stored)
    } else if (initialMessages.length) {
      saveConversation(chatId, initialMessages)
    }
  }, [chatId, initialMessages])

  const ensureChatId = () => {
    if (chatIdRef.current) return chatIdRef.current
    const newId = MOCK_CHAT_ID
    chatIdRef.current = newId
    return newId
  }

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed && queuedFiles.length === 0) return

    const activeChatId = ensureChatId()
    const attachments = queuedFiles.map((file) => ({
      name: file.name,
      size: file.size,
    }))
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
      attachments: attachments.length ? attachments : undefined,
    }

    const baseMessages = [...messages, userMsg]
    setMessages(baseMessages)
    saveConversation(activeChatId, baseMessages)
    setInput("")
    setQueuedFiles([])
    setSending(true)

    try {
      // Simule la réponse assistant
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Ceci est une réponse simulée pour le test de l’affichage.",
        createdAt: Date.now(),
      }
      await new Promise((r) => setTimeout(r, 500))
      if (!isMountedRef.current) return
      setMessages((m) => {
        const updated = [...m, assistantMsg]
        saveConversation(activeChatId, updated)
        return updated
      })
    } finally {
      if (isMountedRef.current) {
        setSending(false)
      }
      if (!chatId && isMountedRef.current) {
        navigate({
          to: "/chat/$chatId",
          params: { chatId: chatIdRef.current! },
        })
      }
    }
  }

  const handleFilesSelected = (files: File[]) => {
    if (!files.length) return
    setQueuedFiles(files)
  }

  const removeAttachment = (index: number) => {
    setQueuedFiles((prev) => prev.filter((_, idx) => idx !== index))
  }

  return (
    <div className="flex h-full flex-col bg-transparent text-sidebar-foreground">
      {/* Zone de messages */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
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
            Assistant écrit...
          </div>
        )}
      </div>

      {/* Barre d’entrée */}
      <div
        className="pointer-events-none sticky bottom-0 z-20 flex w-full justify-center px-4"
      >
        <div className="pointer-events-auto w-full max-w-3xl">
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
  )
}
