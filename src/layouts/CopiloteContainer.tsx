"use client"

import { useState, useCallback, useMemo, useEffect, type CSSProperties } from "react"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "~/components/ui/empty"
import { BotMessageSquare } from "lucide-react"
import { ChatInput } from "~/components/ChatInput"
import { useCourseType } from "~/context/CourseTypeContext"
import { getCourseAccent } from "~/utils/courseTypeStyles"
import { cn } from "~/lib/utils"
import { sendChatMessage } from "~/server/chat.server"
import { useAppSession } from "~/utils/session"
import { useApiRedirect } from "~/hooks/useApiRedirect"
import { loadConversation } from "~/components/Chat"
import { BotMessageDisplay } from "~/components/BotMessageDisplay"

interface CopiloteContainerProps {
  className?: string
  sessionId?: string
}

/**
 * Right-side assistant panel with dynamic glassmorphism & accent gradient.
 */
export default function CopiloteContainer({ className = "", sessionId }: CopiloteContainerProps) {
  const [prompt, setPrompt] = useState("")
  const [messages, setMessages] = useState<string[]>([])
  const { courseType } = useCourseType()
  const { session } = useAppSession()
  const { handleRedirect } = useApiRedirect()
  const accent = useMemo(() => getCourseAccent(courseType === "deep" ? "none" : courseType), [courseType])

  // 🔄 Charger les messages de la session au montage
  useEffect(() => {
    if (sessionId) {
      const conversation = loadConversation(sessionId)
      if (conversation && conversation.length > 0) {
        // Créer une liste plate des messages (alternant user/assistant)
        const flatMessages = conversation.flatMap((msg) => [msg.content])
        setMessages(flatMessages)
      }
    }
  }, [sessionId])

  const contentText = useMemo(() => {
    switch (courseType) {
      case "exercice":
        return "les exercices"
      case "cours":
        return "le cours"
      case "deep":
        return "les cours approfondis"
      case "discuss":
        return "les discussions"
      default:
        return "votre contenu"
    }
  }, [courseType])

  // Animated gradient title
  const headingStyle = useMemo(
    () =>
      ({
        backgroundImage: accent.gradient,
        backgroundSize: "300% 300%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
        animation: "neon-flow 12s linear infinite",
      }) as CSSProperties,
    [accent]
  )

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim()) return
    
    const userId =
      session.googleSub ?? (session.userId != null ? String(session.userId) : "anonymous-user")
    
    try {
      console.info("Copilote prompt:", prompt)
      
      const res = await sendChatMessage({
        data: {
          user_id: userId,
          message: prompt,
        },
      })

      console.log("%c🤖 Copilote Response", "color: #00ff00; font-weight: bold; font-size: 14px;", {
        agent: res.agent,
        redirect_id: res.redirect_id,
        reply: res.reply,
      })

      // Add the response to messages
      setMessages((m) => [...m, prompt.trim(), res.reply])
      setPrompt("")

      // 🎯 Redirection basée sur l'agent et redirect_id (via hook)
      handleRedirect(res)
    } catch (err) {
      console.error("❌ Erreur Copilote:", err)
      setMessages((m) => [...m, prompt.trim(), "Erreur lors de la requête"])
      setPrompt("")
    }
  }, [prompt, session, handleRedirect])

  return (
    <aside
      className={cn(
        `
        hidden md:flex flex-1 flex-col
        rounded-[28px] border 
        backdrop-blur-[22px] backdrop-saturate-150
        bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.05))]
        dark:bg-[linear-gradient(135deg,rgba(24,24,27,0.35),rgba(39,39,42,0.25))]
        border-white/30 dark:border-white/10
        shadow-[inset_0_1px_3px_rgba(255,255,255,0.2),0_8px_30px_rgba(0,0,0,0.25)]
        transition-all duration-500 ease-out
        hover:shadow-[inset_0_1px_6px_rgba(255,255,255,0.25),0_12px_40px_rgba(0,0,0,0.35)]
        p-6
      `,
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
        <div>
          <h2 className="text-lg font-semibold" style={headingStyle}>
            Copilote
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Retrouvez ici les recommandations et les ressources contextuelles liées à votre contenu.
          </p>
        </div>

        {/* Empty state when there are no messages */}
        {/**
         * NOTE: messages are local to this container for now. If you have a
         * global/message store, replace this with the real messages array.
         */}
        {messages.length === 0 ? (
          <Empty className="mt-6">
            <EmptyMedia className="mb-4">
              <BotMessageSquare className="size-16" style={{ color: accent.accent }} />
            </EmptyMedia>

            <EmptyHeader>
              <EmptyTitle>Posez une question</EmptyTitle>
              <EmptyDescription>
                {`Vous pouvez poser des questions à votre Copilote si vous avez des questions sur ${contentText}.`}
              </EmptyDescription>
            </EmptyHeader>

            <EmptyContent>
              <div className="text-sm text-muted-foreground">
                Commencez par écrire votre question dans la barre ci-dessous.
              </div>
            </EmptyContent>
          </Empty>
        ) : (
          /* Display conversation messages */
          <div className="flex flex-col gap-3 overflow-y-auto pr-2">
            {messages.map((message, index) => {
              const isUserMessage = index % 2 === 0
              return (
                <div
                  key={index}
                  className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={cn(
                      "max-w-[75%] text-sm leading-relaxed whitespace-pre-wrap transition-all duration-300",
                      isUserMessage
                        ? "rounded-2xl px-4 py-2 backdrop-blur-xl bg-[rgba(173,216,230,0.15)] dark:bg-[rgba(173,216,230,0.08)] text-black dark:text-white shadow-lg border border-white/20"
                        : "bg-transparent text-foreground"
                    )}
                  >
                    {/* 💬 Afficher avec shimmering si c'est le dernier message (réponse du bot) */}
                    {!isUserMessage ? (
                      <BotMessageDisplay
                        content={message}
                        isLatest={index === messages.length - 1}
                        showShimmering={true}
                      />
                    ) : (
                      message
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Chat input */}
      <ChatInput
        value={prompt}
        onChange={setPrompt}
        onSubmit={handleSubmit}
        disableAttachments={false}
        isSending={false}
        className="mt-auto"
        placeholder="Demandez une assistance au copilote..."
      />
    </aside>
  )
}
