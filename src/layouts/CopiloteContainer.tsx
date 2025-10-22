"use client"

import React, { useState, useCallback, useMemo, useEffect, useRef, type CSSProperties } from "react"
import ReactMarkdown from "react-markdown"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "~/components/ui/empty"
import { ScrollArea } from "~/components/ui/scroll-area"
import { BotMessageSquare } from "lucide-react"
import { ChatInput } from "~/components/ChatInput"
import { useCourseType, CourseTypeProvider } from "~/context/CourseTypeContext"
import { getCourseAccent } from "~/utils/courseTypeStyles"
import { cn } from "~/lib/utils"
import { sendChatMessage } from "~/server/chat.server"
import { useAppSession } from "~/utils/session"
import { useApiRedirect } from "~/hooks/useApiRedirect"
import { BotMessageDisplay } from "~/components/BotMessageDisplay"
import { useSessionCache } from "~/hooks/useSessionCache"

interface CopiloteContainerProps {
  className?: string
  sessionId?: string | null
  userId?: string | null
  isCopiloteModal?: boolean
  forceDeepMode?: boolean
}

/**
 * Internal component with actual content - wrapped with forced courseType provider
 */
function CopiloteContainerContent({
  className = "",
  sessionId,
  userId,
  isCopiloteModal = false,
}: Omit<CopiloteContainerProps, "forceDeepMode">) {
  const [prompt, setPrompt] = useState("")
  const [messages, setMessages] = useState<string[]>([])
  const [isNewMessage, setIsNewMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { courseType } = useCourseType()
  const { session } = useAppSession()
  const { handleRedirect } = useApiRedirect()
  
  // ⏳ Utiliser le userId passé en props EN PRIORITÉ, sinon récupérer de la session
  const effectiveUserId = useMemo(() => {
    if (userId) {
      console.log(`✅ [CopiloteContainer] Utilisation du userId passé en props: ${userId}`)
      return userId
    }
    if (session.userId != null) {
      const sessionUserId = String(session.userId)
      console.log(`✅ [CopiloteContainer] Utilisation du userId de la session: ${sessionUserId}`)
      return sessionUserId
    }
    console.warn(`⚠️ [CopiloteContainer] Session pas encore hydratée, userId = ${session.userId}`)
    return null
  }, [userId, session.userId])
  
  // 🚀 Déterminer le docType basé sur le courseType
  const docType = useMemo(() => {
    if (courseType === "exercice") return "exercise"
    if (courseType === "cours") return "course"
    if (courseType === "deep") return "course" // Deep courses are courses
    return undefined // Fallback à auto-detect si vraiment on sait pas
  }, [courseType])

  // 🚀 Utiliser le cache React Query avec le bon docType
  const { data, isLoading: chatLoading } = useSessionCache(
    sessionId || null,
    docType,
    effectiveUserId || undefined,
    { enabled: !!sessionId && !!effectiveUserId && !!docType }
  )
  
  // Use courseType directly, will be forced to "deep" by provider if in modal
  const accent = useMemo(() => getCourseAccent(courseType), [courseType])

  // 🔄 Mettre à jour les messages quand le cache se charge
  useEffect(() => {
    if (data?.messages) {
      const displayMessages: string[] = []
      for (const msg of data.messages) {
        if (msg.text) {
          displayMessages.push(msg.text)
        }
      }
      setMessages(displayMessages)
      setIsNewMessage(false)
      console.log(`✅ [CopiloteContainer] ${displayMessages.length} messages chargés du cache`)
    }
  }, [data?.messages])

  // 📜 Auto-scroll vers le bas quand les messages changent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
    if (!prompt.trim() || !effectiveUserId) {
      if (!effectiveUserId) {
        console.warn(`⚠️ [CopiloteContainer] Impossible d'envoyer: userId non disponible`)
      }
      return
    }
    
    try {
      console.info("Copilote prompt:", prompt)
      console.log(`📤 [CopiloteContainer] Envoi avec userId: ${effectiveUserId}`)
      
      const res = await sendChatMessage({
        data: {
          user_id: effectiveUserId,
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
      setIsNewMessage(true) // ✨ Activer le shimmering pour le nouveau message du bot

      // 🎯 Redirection basée sur l'agent et redirect_id (via hook)
      handleRedirect(res)
    } catch (err) {
      console.error("❌ Erreur Copilote:", err)
      setMessages((m) => [...m, prompt.trim(), "Erreur lors de la requête"])
      setPrompt("")
    }
  }, [prompt, effectiveUserId, handleRedirect])

  return (
    <aside
      className={cn(
        `
        flex flex-col h-full
        rounded-[28px] border border-white/20 dark:border-white/10
        backdrop-blur-xl backdrop-saturate-150
        bg-[rgba(255,255,255,0.15)] dark:bg-[rgba(24,24,27,0.45)]
        shadow-[inset_0_1px_3px_rgba(255,255,255,0.3),0_12px_40px_rgba(0,0,0,0.25)]
        transition-all duration-300
        p-6 overflow-hidden
      `,
        !isCopiloteModal && "hidden md:flex",
        className
      )}
    >
      {/* Header + Messages Container */}
      <div className="flex flex-col gap-4 overflow-hidden flex-1 min-h-0">
        <div>
          <h2 className="text-lg font-semibold" style={headingStyle}>
            Copilote
          </h2>
        </div>

        {/* Messages Area with ScrollArea */}
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
          <ScrollArea className="flex-1 min-h-0 rounded-lg">
            <div className="flex flex-col gap-3 pr-4">
              {messages.map((message, index) => {
                const isUserMessage = index % 2 === 0
                return (
                  <div
                    key={index}
                    className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] text-sm leading-relaxed transition-all duration-300",
                        isUserMessage
                          ? "rounded-2xl px-4 py-2 backdrop-blur-2xl backdrop-saturate-150 bg-white/15 dark:bg-white/10 text-zinc-900 dark:text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.1)] border border-white/30 dark:border-white/20 hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.5),0_6px_16px_rgba(0,0,0,0.15)]"
                          : "bg-transparent text-foreground"
                      )}
                    >
                      {/* 💬 Afficher avec shimmering UNIQUEMENT si c'est un nouveau message reçu (pas au chargement initial) */}
                      {!isUserMessage ? (
                        <BotMessageDisplay
                          content={message}
                          isLatest={index === messages.length - 1}
                          showShimmering={isNewMessage && index === messages.length - 1}
                        />
                      ) : (
                        message
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Chat input */}
      <ChatInput
        value={prompt}
        onChange={setPrompt}
        onSubmit={handleSubmit}
        disableAttachments={false}
        isSending={false}
        className="flex-shrink-0"
        placeholder="Demandez une assistance au copilote..."
      />
    </aside>
  )
}

/**
 * Forced "deep" mode provider for modal use
 */
function ForcedDeepModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <CourseTypeProvider>
      <ForcedDeepModeWrapper>{children}</ForcedDeepModeWrapper>
    </CourseTypeProvider>
  )
}

/**
 * Wrapper that forces courseType to "deep"
 */
function ForcedDeepModeWrapper({ children }: { children: React.ReactNode }) {
  const { setCourseType } = useCourseType()
  useEffect(() => {
    setCourseType("deep")
  }, [setCourseType])
  return <>{children}</>
}

/**
 * Wrapper component that forces "deep" courseType when in modal mode
 */
export default function CopiloteContainer({
  className = "",
  sessionId,
  userId,
  isCopiloteModal = false,
  forceDeepMode = false,
}: CopiloteContainerProps) {
  // If forceDeepMode is true, wrap content with provider forcing "deep"
  if (forceDeepMode) {
    return (
      <ForcedDeepModeProvider>
        <CopiloteContainerContent
          className={className}
          sessionId={sessionId}
          userId={userId}
          isCopiloteModal={isCopiloteModal}
        />
      </ForcedDeepModeProvider>
    )
  }

  // Otherwise, render content normally (inherits context from parent)
  return (
    <CopiloteContainerContent
      className={className}
      sessionId={sessionId}
      userId={userId}
      isCopiloteModal={isCopiloteModal}
    />
  )
}
