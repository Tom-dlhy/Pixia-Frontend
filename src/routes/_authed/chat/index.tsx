"use client"

import { createFileRoute } from "@tanstack/react-router"
import { useNavigate, useLocation } from "@tanstack/react-router"
import { useCallback, useState, useEffect } from "react"
import { Chat, ChatMessage, saveConversation } from "~/components/Chat"
import { ChatInput } from "~/components/ChatInput"
import { SectionCards } from "~/components/SectionCards"
import { sendChatMessage } from "~/server/chat.server"
import { useAppSession } from "~/utils/session"
import { Button } from "~/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { cn } from "~/lib/utils"
import { useSidebar } from "~/components/ui/sidebar"
import { useApiRedirect } from "~/hooks/useApiRedirect"
import { useChatSessions } from "~/context/ChatSessionsContext"
import { useAllChatSessions } from "~/hooks/useListCache"

export const Route = createFileRoute("/_authed/chat/")({
  component: ChatPage,
})

function ChatPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session } = useAppSession()
  const { setOpen } = useSidebar()
  const { handleRedirect } = useApiRedirect()
  const { setSessions: setGlobalSessions } = useChatSessions()

  const [showCards, setShowCards] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [queuedFiles, setQueuedFiles] = useState<File[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  // � Utiliser le hook de cache React Query
  const { sessions, isLoading: loadingSessions } = useAllChatSessions()

  // 🔍 Vérifier si on est sur /chat (pas /chat/$id)
  const isOnChatHome = location.pathname === "/chat" || location.pathname === "/chat/"

  const userId =
    session.userId != null ? String(session.userId) : "anonymous-user"

  // 🐛 Debug: Afficher les infos de session au montage
  useEffect(() => {
    if (userId !== "anonymous-user") {
      console.log("🔐 [ChatPage] Utilisateur authentifié:", { userId, email: session.userEmail })
    }
  }, [userId])

  useEffect(() => {
    // 🔹 Sur la page /chat (index), on commence toujours avec une nouvelle session
    // On NE restaure PAS le sessionId depuis le sessionStorage
    setSessionId(null)
    setHasInitialized(true)
  }, [])

  useEffect(() => {
    setOpen(true)
  }, [setOpen])

  useEffect(() => {
    if (sessionId) sessionStorage.setItem("chatSession", sessionId)
  }, [sessionId])

  // 📤 Mettre à jour le context global avec les sessions
  useEffect(() => {
    setGlobalSessions(sessions)
  }, [sessions, setGlobalSessions])


  // 📩 Envoi d'un message
  const handleSend = useCallback(async () => {
    if (!input.trim()) return
    setSending(true)
    setError(null)

    try {
      // 🔹 Conversion des fichiers en base64
      const encodedFiles = await Promise.all(
        queuedFiles.map(
          (file) =>
            new Promise<{ name: string; data: string; type?: string; size?: number }>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () =>
                resolve({
                  name: file.name,
                  data: (reader.result as string).split(",")[1],
                  type: file.type,
                  size: file.size,
                })
              reader.onerror = reject
              reader.readAsDataURL(file)
            })
        )
      )

      console.log("📤 Sending to API:", { userId, sessionId, message: input, encodedFiles })

      const res = await sendChatMessage({
        data: {
          user_id: userId,
          sessionId: sessionId ?? undefined,
          message: input,
          files: encodedFiles.length ? encodedFiles : undefined,
        },
      })

      console.log("📥 Response from API:", res)
      console.log("📥 Agent:", res.agent)
      console.log("📥 Redirect ID:", res.redirect_id)
      console.log("📥 Full response keys:", Object.keys(res))
      console.log("%c🤖 API Response", "color: #00ff00; font-weight: bold; font-size: 14px;", {
        agent: res.agent,
        redirect_id: res.redirect_id,
        reply: res.reply,
        session_id: res.session_id
      })

      const newSessionId = res.session_id
      // 🔹 Si on est sur /chat (accueil) et qu'on reçoit une session → c'est nouveau
      const wasNewSession = isOnChatHome && !!newSessionId

      console.log("🔍 Debug:", { sessionId, newSessionId, wasNewSession, isOnChatHome })

      if (newSessionId && newSessionId !== sessionId) {
        setSessionId(newSessionId)
        sessionStorage.setItem("chatSession", newSessionId)
      }

      // 🔹 Mise à jour du chat
      const newMessages: ChatMessage[] = [
        ...messages,
        { id: crypto.randomUUID(), role: "user", content: input, createdAt: Date.now() },
        { id: crypto.randomUUID(), role: "assistant", content: res.reply, createdAt: Date.now() },
      ]

      setMessages(newMessages)
      saveConversation(newSessionId ?? sessionId ?? "default", newMessages)

      // 🎯 Redirection basée sur l'agent et redirect_id (via hook)
      if (!handleRedirect(res)) {
        // 🔹 Si pas de redirection automatique, redirection au premier message (nouvelle session)
        if (wasNewSession) {
          setTimeout(() => {
            setOpen(false)
            navigate({ to: `/chat/${newSessionId}`, replace: true })
          }, 200)
        }
      }
    } catch (err) {
      console.error("❌ Erreur lors de l'envoi :", err)
      setError("Une erreur est survenue lors de l'envoi du message.")
    } finally {
      setInput("")
      setSending(false)
    }
  }, [input, messages, userId, sessionId, queuedFiles, navigate, setOpen])

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
    setMessages([])
    setInput("")
    setSessionId(null)
    sessionStorage.removeItem("chat:conversations")
    sessionStorage.removeItem("chatSession")
    setShowCards(true)
    navigate({ to: "/chat" })
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 relative">

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

      <div
        className={cn(
          "w-full mx-auto transform transition-all duration-700 ease-out",
          showCards ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-6 scale-95"
        )}
      >
        {showCards && <SectionCards />}
      </div>

      <div
        className={cn(
          "w-full flex-1 flex flex-col min-h-0 mx-auto transform transition-all duration-700 ease-out",
          showCards
            ? "opacity-0 translate-y-6 scale-95 pointer-events-none"
            : "opacity-100 translate-y-0 scale-100 pointer-events-auto"
        )}
      >
        {!showCards && <Chat messages={messages} sending={sending} error={error} />}
      </div>

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
    </div>
  )
}

