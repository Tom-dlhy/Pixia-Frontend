"use client"

import { useEffect, useRef, useState } from "react"
import { Paperclip } from "lucide-react"
import { ShimmeringText } from "~/components/ui/shimmering-text"
import { TextGenerateEffect } from "~/components/ui/text-generate-effect"

// ----------------------
// 🔹 Types
// ----------------------
export type ChatAttachment = { name: string; size: number }

export type ChatMessage = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: number
  attachments?: ChatAttachment[]
}

const STORAGE_KEY = "chat:conversations"
const MOCK_CHAT_ID = "test-session"

// ----------------------
// 🔹 Helpers
// ----------------------
export function loadConversation(id: string): ChatMessage[] | null {
  if (typeof window === "undefined") return null
  try {
    const data = sessionStorage.getItem(STORAGE_KEY)
    if (!data) return null
    const parsed = JSON.parse(data) as Record<string, ChatMessage[]>
    return parsed[id] ?? null
  } catch {
    return null
  }
}

export function saveConversation(id: string, messages: ChatMessage[]) {
  if (typeof window === "undefined") return
  try {
    const data = sessionStorage.getItem(STORAGE_KEY)
    const parsed = data ? (JSON.parse(data) as Record<string, ChatMessage[]>) : {}
    parsed[id] = messages
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
  } catch {}
}

// ----------------------
// 🔹 Component
// ----------------------
export function Chat({
  chatId,
  messages: propMessages,
  sending,
  error,
}: {
  chatId?: string
  messages?: ChatMessage[]
  sending?: boolean
  error?: string | null
}) {
  const listRef = useRef<HTMLDivElement | null>(null)

  // 🌗 Détection du thème clair/sombre
  const [isDark, setIsDark] = useState<boolean>(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  )

  useEffect(() => {
    if (typeof document === "undefined") return
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  // 🧪 MOCK MESSAGES (pour test)
  const messages: ChatMessage[] =
    propMessages && propMessages.length > 0
      ? propMessages
      : [
          {
            id: "1",
            role: "user",
            content: "Ceci est un test de bulle utilisateur.",
            createdAt: Date.now(),
            attachments: [],
          },
          {
            id: "2",
            role: "assistant",
            content: "Salut Tom, je suis ton assistant.",
            createdAt: Date.now(),
            attachments: [],
          },
        ]

  console.log("Messages rendus :", messages)

  // 📜 Scroll automatique
  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [messages])

  // 🎨 Couleurs dynamiques selon le thème
  const shimmerColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.7)"
  const baseColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)"

  return (
    <div className="flex h-full flex-col bg-transparent text-sidebar-foreground transition-colors duration-500">
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* 🔹 Messages */}
        {messages.map((m, index) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] text-sm leading-relaxed whitespace-pre-wrap transition-all duration-300 ${
                m.role === "user"
                  ? "rounded-2xl px-4 py-2 backdrop-blur-xl bg-[rgba(173,216,230,0.15)] dark:bg-[rgba(173,216,230,0.08)] text-black dark:text-white shadow-lg border border-white/20"
                  : "bg-transparent text-foreground"
              }`}
            >
              {/* 💬 Si c’est la dernière réponse de l’assistant → effet mot par mot */}
              {m.role === "assistant" && index === messages.length - 1 ? (
                <TextGenerateEffect
                  words={m.content}
                  duration={0.3}
                  staggerDelay={0.06}
                  filter
                  className="font-normal text-foreground"
                />
              ) : (
                m.content
              )}

              {/* 📎 Pièces jointes */}
              {m.attachments && m.attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs opacity-80">
                  {m.attachments.map((file: ChatAttachment) => (
                    <span
                      key={`${m.id}-${file.name}`}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] ${
                        isDark ? "bg-white/10" : "bg-black/10"
                      }`}
                    >
                      <Paperclip className="h-3 w-3" />
                      <span className="max-w-[140px] truncate">{file.name}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 🧠 Effet shimmering pendant la réflexion */}
        {sending && (
          <div className="flex justify-start">
            <div className="max-w-[75%] text-sm bg-transparent text-foreground px-2 py-1">
              <ShimmeringText
                text="L’assistant réfléchit..."
                duration={1.2}
                wave
                shimmeringColor={shimmerColor}
                color={baseColor}
                className="font-medium"
              />
            </div>
          </div>
        )}

        {/* ⚠️ Message d’erreur */}
        {error && <div className="px-4 text-xs text-red-500 italic">{error}</div>}
      </div>
    </div>
  )
}
