"use client"

import { createFileRoute } from "@tanstack/react-router"
import { useNavigate, useLocation } from "@tanstack/react-router"
import { useCallback, useState, useEffect } from "react"
import { Chat, ChatMessage, saveConversation } from "~/components/Chat"
import { ChatInput } from "~/components/ChatInput"
import { SectionCards } from "~/components/SectionCards"
import { sendChatMessage } from "~/server/chat.server"
import { useAppSession } from "~/utils/session"
import { cn } from "~/lib/utils"
import { useSidebar } from "~/components/ui/sidebar"
import { useApiRedirect } from "~/hooks/useApiRedirect"
import { useChatSessions } from "~/context/ChatSessionsContext"
import { useAllChatSessions } from "~/hooks/useListCache"
import { useCourseType } from "~/context/CourseTypeContext"
import { useSendChatWithRefresh } from "~/hooks/useSendChatWithRefresh"
import "~/styles/loader.css"

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
  const { courseType } = useCourseType()
  const { send: sendChatWithRefresh } = useSendChatWithRefresh()

  const [showCards, setShowCards] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [queuedFiles, setQueuedFiles] = useState<File[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)
  const { sessions, isLoading: loadingSessions } = useAllChatSessions()
  const isOnChatHome = location.pathname === "/chat" || location.pathname === "/chat/"

  const userId =
    session.userId != null ? String(session.userId) : "anonymous-user"

  useEffect(() => {
    if (userId !== "anonymous-user") {
      
    }
  }, [userId])

  useEffect(() => {
    setSessionId(null)
    setHasInitialized(true)
  }, [])

  useEffect(() => {
    setOpen(true)
  }, [setOpen])

  useEffect(() => {
    if (sessionId) sessionStorage.setItem("chatSession", sessionId)
  }, [sessionId])

  useEffect(() => {
    setGlobalSessions(sessions)
  }, [sessions, setGlobalSessions])

  const handleSend = useCallback(async () => {
    if (!input.trim()) return
    setSending(true)
    setShowCards(false)
    setError(null)

    try {
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

      

      const res = await sendChatWithRefresh({
        user_id: userId,
        sessionId: sessionId ?? undefined,
        message: input,
        files: encodedFiles.length ? encodedFiles : undefined,
        messageContext: {
          agentIndication: courseType === "cours" ? "cours" : courseType === "exercice" ? "exercice" : "chat",
          userFullName: session.name || undefined,
          userStudy: session.study || undefined,
        },
      })

      const newSessionId = res.session_id
      const wasNewSession = isOnChatHome && !!newSessionId

      if (newSessionId && newSessionId !== sessionId) {
        setSessionId(newSessionId)
        sessionStorage.setItem("chatSession", newSessionId)
      }

      const newMessages: ChatMessage[] = [
        ...messages,
        { id: crypto.randomUUID(), role: "user", content: input, createdAt: Date.now() },
        { id: crypto.randomUUID(), role: "assistant", content: res.reply, createdAt: Date.now() },
      ]

      setMessages(newMessages)
      saveConversation(newSessionId ?? sessionId ?? "default", newMessages)

      if (!handleRedirect(res)) {
        if (wasNewSession) {
          setTimeout(() => {
            setOpen(false)
            navigate({ to: `/chat/${newSessionId}`, replace: true })
          }, 200)
        }
      }
      
      setSending(false)
    } catch (err) {
      console.error("Erreur lors de l'envoi :", err)
      setError("Une erreur est survenue lors de l'envoi du message.")
      setSending(false)
    } finally {
      setInput("")
    }
  }, [input, messages, userId, sessionId, queuedFiles, navigate, setOpen])

  const handleFilesSelected = (files: File[]) => {
    if (files.length) setQueuedFiles(files)
  }

  const removeAttachment = (index: number) => {
    setQueuedFiles((prev) => prev.filter((_, i) => i !== index))
  }

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
    <div className="w-full h-full flex flex-col items-center justify-center relative">

      <div
        className={cn(
          "w-full transform transition-all duration-700 ease-out",
          showCards && !sending ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-6 scale-95"
        )}
      >
        {showCards && !sending && <SectionCards />}
      </div>

      <div
        className={cn(
          "w-full h-full flex items-center justify-center transform transition-all duration-700 ease-out",
          sending ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-6 scale-95"
        )}
      >
        {sending && (
          <div className="flex flex-col items-center gap-4">
            <div className="loader"></div>
          </div>
        )}
      </div>

      <div
        className={cn(
          "w-full flex-1 flex flex-col min-h-0 transform transition-all duration-700 ease-out",
          showCards
            ? "opacity-0 translate-y-6 scale-95 pointer-events-none"
            : "opacity-100 translate-y-0 scale-100 pointer-events-auto"
        )}
      >
        {!showCards && messages.length > 0 && <Chat messages={messages} sending={sending} error={error} />}
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex w-full justify-center px-4 py-6 transition-all duration-500 pointer-events-none">
        <div className="w-full max-w-3xl pointer-events-auto">
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

