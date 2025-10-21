import { createFileRoute } from "@tanstack/react-router"
import { useParams, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Chat, ChatMessage, loadConversation, saveConversation } from "~/components/Chat"
import { ChatInput } from "~/components/ChatInput"
import { ScrollArea } from "~/components/ui/scroll-area"
import { sendChatMessage } from "~/server/chat.server"
import { useAppSession } from "~/utils/session"
import { useSidebar } from "~/components/ui/sidebar"
import { Button } from "~/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useApiRedirect } from "~/hooks/useApiRedirect"

export const Route = createFileRoute("/_authed/chat/$id")({
  component: ChatSessionPage,
})

function ChatSessionPage() {
  const { id } = useParams({ from: "/_authed/chat/$id" })
  const navigate = useNavigate()
  const { session } = useAppSession()
  const { setOpen } = useSidebar()
  const { handleRedirect } = useApiRedirect()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [queuedFiles, setQueuedFiles] = useState<File[]>([])

  useEffect(() => {
    setOpen(false)
    const stored = loadConversation(id)
    if (stored) setMessages(stored)
  }, [id, setOpen])

  const userId =
    session.userId != null ? String(session.userId) : "anonymous-user"

  const handleSend = async () => {
    if (!input.trim()) return
    setSending(true)
    setError(null)

    try {
      // 🧩 Conversion des fichiers en base64 (si présents)
      const encodedFiles = await Promise.all(
        queuedFiles.map(
          (file) =>
            new Promise<{ name: string; data: string; type?: string; size?: number }>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () =>
                resolve({
                  name: file.name,
                  data: (reader.result as string).split(",")[1], // retire le header base64
                  type: file.type,
                  size: file.size,
                })
              reader.onerror = reject
              reader.readAsDataURL(file)
            })
        )
      )

      const res = await sendChatMessage({
        data: {
          user_id: "anonymous-user",
          sessionId: id,
          message: input,
          files: encodedFiles, // ✅ correspond au schéma attendu
        },
      })

      console.log("%c🤖 API Response", "color: #00ff00; font-weight: bold; font-size: 14px;", {
        agent: res.agent,
        redirect_id: res.redirect_id,
        reply: res.reply,
        session_id: res.session_id
      })

      const newMessages: ChatMessage[] = [
        ...messages,
        { id: crypto.randomUUID(), role: "user", content: input, createdAt: Date.now() },
        { id: crypto.randomUUID(), role: "assistant", content: res.reply, createdAt: Date.now() },
      ]

      setMessages(newMessages)
      saveConversation(id, newMessages)

      // 🎯 Redirection basée sur l'agent et redirect_id (via hook)
      handleRedirect(res)
    } catch (err) {
      console.error("Erreur lors de l’envoi :", err)
      setError("Une erreur est survenue lors de l’envoi du message.")
    } finally {
      setInput("")
      setSending(false)
    }
  }

  const handleFilesSelected = (files: File[]) => {
    if (files.length) setQueuedFiles(files)
  }

  const removeAttachment = (index: number) => {
    setQueuedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // 🔙 Bouton retour
  const handleBack = () => {
    setOpen(true)
    sessionStorage.removeItem("chat:conversations")
    sessionStorage.removeItem("chatSession")
    navigate({ to: "/chat" })
  }

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-10">
      {/* 🔙 Back Button + Chat Container */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Back Button */}
        <div className="flex-shrink-0 pt-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-full bg-muted/30 hover:bg-muted/50 backdrop-blur-md transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 mb-4 rounded-lg">
            <Chat messages={messages} sending={sending} error={error} />
          </ScrollArea>
        </div>
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
