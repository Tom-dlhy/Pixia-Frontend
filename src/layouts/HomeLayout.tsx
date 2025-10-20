"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useRouterState, useNavigate } from "@tanstack/react-router"
import { SidebarProvider, SidebarInset, useSidebar } from "~/components/ui/sidebar"
import { AppSidebar } from "~/components/AppSidebar"
import { Chat, ChatMessage, saveConversation } from "~/components/Chat"
import { ChatInput } from "~/components/ChatInput"
import { SectionCards } from "~/components/SectionCards"
import { useCourseType } from "~/context/CourseTypeContext"
import { getCourseAccent } from "~/utils/courseTypeStyles"
import { GradientBackground } from "~/components/ui/gradient-background"
import { getGradientClasses } from "~/utils/getGradientClasses"
import { cn } from "~/lib/utils"
import { sendChatMessage } from "../server/chat.server"
import { useAppSession } from "~/utils/session"
import { Button } from "~/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function HomeLayout({ user, children }: { user?: any; children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <HomeLayoutContent user={user}>{children}</HomeLayoutContent>
    </SidebarProvider>
  )
}

function HomeLayoutContent({ user, children }: { user?: any; children: React.ReactNode }) {
  const { location } = useRouterState()
  const navigate = useNavigate()
  const { courseType } = useCourseType()
  const { session } = useAppSession()
  const { setOpen } = useSidebar()

  // 🌙 Gestion du thème
  const [isDark, setIsDark] = useState(
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

  // 💬 États du chat
  const [showCards, setShowCards] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [queuedFiles, setQueuedFiles] = useState<File[]>([])

  // 🧠 Nouvelle gestion de session_id
  const [sessionId, setSessionId] = useState<string | null>(null)

  // 🔁 Persistance du session_id dans sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("chatSession")
    if (stored) setSessionId(stored)
  }, [])

  useEffect(() => {
    if (sessionId) sessionStorage.setItem("chatSession", sessionId)
  }, [sessionId])

  // 🧑‍💻 Utilisateur
  const userId =
    session.googleSub ?? (session.userId != null ? String(session.userId) : "anonymous-user")

  const accentKey = courseType === "deep" ? "none" : courseType
  const accent = getCourseAccent(accentKey)
  const showChatHome = location.pathname === "/" || location.pathname === "/chat"
  const gradientClass = getGradientClasses(isDark)

  // 📩 Envoi d’un message
  const handleSend = useCallback(async () => {
    if (!input.trim()) return
    const isFirstMessage = messages.length === 0

    // ✅ Transition dès l’envoi
    if (isFirstMessage) {
      setShowCards(false)
      setTimeout(() => setOpen(false), 200)
    }

    setSending(true)
    setError(null)

    try {
      const res = await sendChatMessage({
        data: {
          user_id: userId,
          sessionId: sessionId ?? undefined,
          message: input,
        },
      })

      // ✅ Sauvegarde du nouveau session_id si créé
      if (res.session_id && res.session_id !== sessionId) {
        setSessionId(res.session_id)
      }

      const newMessages: ChatMessage[] = [
        ...messages,
        { id: crypto.randomUUID(), role: "user", content: input, createdAt: Date.now() },
        { id: crypto.randomUUID(), role: "assistant", content: res.reply, createdAt: Date.now() },
      ]

      setMessages(newMessages)
      saveConversation(res.session_id ?? sessionId ?? "default", newMessages)
    } catch (err) {
      console.error("Erreur lors de l’envoi :", err)
      setError("Une erreur est survenue lors de l’envoi du message.")
    } finally {
      setInput("")
      setSending(false)
    }
  }, [input, messages, userId, sessionId, setOpen])

  // 📎 Fichiers
  const handleFilesSelected = (files: File[]) => {
    if (files.length) setQueuedFiles(files)
  }

  const removeAttachment = (index: number) => {
    setQueuedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // 🔙 Bouton retour
  const handleBack = () => {
    setOpen(true)
    setTimeout(() => {
      setMessages([])
      setInput("")
      sessionStorage.removeItem("chat:conversations")
      sessionStorage.removeItem("chatSession") // ❌ reset session
      setSessionId(null)
      setShowCards(true)
      navigate({ to: "/chat" })
    }, 300)
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden text-sidebar-foreground transition-all duration-500">
      <AppSidebar user={user} />
      <SidebarInset className="relative flex flex-1 flex-col overflow-hidden">
        {/* 🌈 Fond dynamique */}
        <GradientBackground key={gradientClass} className={`absolute inset-0 ${gradientClass}`}>
          <div className="absolute inset-0 backdrop-blur-2xl transition-colors duration-700" />
        </GradientBackground>

        <main className="relative z-10 flex flex-col w-full h-full overflow-y-auto px-4 sm:px-6 lg:px-10 py-8">
          <section className="flex flex-1 flex-col gap-8 min-h-0">
            {children && <div className="w-full max-w-4xl mx-auto">{children}</div>}

            {showChatHome && (
              <>
                {!showCards && (
                  <div className="absolute top-6 left-6 z-30">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBack}
                      className="rounded-full bg-muted/30 hover:bg-muted/50 backdrop-blur-md transition-all"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  </div>
                )}

                {/* 🟢 SectionCards avec animation */}
                <div
                  className={cn(
                    "w-full max-w-4xl mx-auto transform transition-all duration-700 ease-out",
                    showCards
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 -translate-y-6 scale-95"
                  )}
                >
                  {showCards && <SectionCards />}
                </div>

                {/* 💬 Chat principal */}
                <div
                  className={cn(
                    "w-full max-w-4xl flex-1 flex flex-col min-h-0 mx-auto transform transition-all duration-700 ease-out",
                    showCards
                      ? "opacity-0 translate-y-6 scale-95 pointer-events-none"
                      : "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                  )}
                >
                  {!showCards && (
                    <Chat messages={messages} sending={sending} error={error} />
                  )}
                </div>

                {/* ✏️ Input */}
                <div className="sticky bottom-0 z-20 flex w-full justify-center px-4 mt-6 transition-all duration-500">
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
              </>
            )}
          </section>
        </main>
      </SidebarInset>
    </div>
  )
}
