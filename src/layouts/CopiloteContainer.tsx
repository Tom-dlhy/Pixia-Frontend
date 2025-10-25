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
import { useAppSession } from "~/utils/session"
import { useApiRedirect } from "~/hooks/useApiRedirect"
import { BotMessageDisplay } from "~/components/BotMessageDisplay"
import { useSessionCache } from "~/hooks/useSessionCache"
import { useChapterDocuments } from "~/hooks/useChapterDocuments"
import { useDeepCoursesLayout } from "~/layouts/DeepCourseContext"
import { getChat } from "~/server/chat.server"
import { useSendChatWithRefresh } from "~/hooks/useSendChatWithRefresh"

interface CopiloteContainerProps {
  className?: string
  sessionId?: string | null
  userId?: string | null
  courseType?: import("~/context/CourseTypeContext").CourseType
  isCopiloteModal?: boolean
  forceDeepMode?: boolean
  deepCourseId?: string | null
  chapterId?: string | null
}

/**
 * Internal component with actual content - wrapped with forced courseType provider
 */
function CopiloteContainerContent({
  className = "",
  sessionId,
  userId,
  courseType, // optional explicit prop
  isCopiloteModal = false,
  deepCourseId,
  chapterId,
}: Omit<CopiloteContainerProps, "forceDeepMode">) {
  const [prompt, setPrompt] = useState("")
  const [messages, setMessages] = useState<string[]>([])
  const [isNewMessage, setIsNewMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // Prefer explicit prop `courseType` when provided (avoids race with context)
  const { courseType: contextCourseType } = useCourseType()
  const effectiveCourseType = courseType || contextCourseType
  const { session } = useAppSession()
  const { handleRedirect } = useApiRedirect()
  const { send: sendChatWithRefresh } = useSendChatWithRefresh()
  
  // 🔹 Essayer de récupérer l'activeTab depuis le contexte deep-course (si disponible)
  let activeTab: "cours" | "exercice" | "evaluation" | null = null
  try {
    const deepContext = useDeepCoursesLayout()
    activeTab = deepContext.activeTab
  } catch {
    // Pas dans un contexte deep-course, c'est ok
    activeTab = null
  }
  
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

  // 🔹 Si on reçoit un chapterId (pour deep-course), récupérer les vrai session IDs
  const { data: chapterDocs } = useChapterDocuments(chapterId || undefined)
  
  // 🎯 Déterminer le vrai session ID pour le copilote basé sur l'onglet actif
  const effectiveSessionId = useMemo(() => {
    // Si un sessionId explicite est fourni ET pas de chapterId, l'utiliser (routes non-deep)
    if (sessionId && !chapterId) {
      console.log(`📍 [CopiloteContainer] Utilisation du sessionId explicite: ${sessionId}`)
      return sessionId
    }
    
    // Si on a un chapterId et les docs du chapitre, utiliser le bon session_id selon l'onglet
    if (chapterId && chapterDocs) {
      let selectedId: string | null = null
      
      if (activeTab === "cours") {
        selectedId = chapterDocs.course_session_id || null
      } else if (activeTab === "exercice") {
        selectedId = chapterDocs.exercice_session_id || null
      } else if (activeTab === "evaluation") {
        selectedId = chapterDocs.evaluation_session_id || null
      } else {
        // Fallback au cours par défaut
        selectedId = chapterDocs.course_session_id || null
      }
      
      console.log(`📍 [CopiloteContainer] activeTab="${activeTab}", sessionId="${selectedId}" depuis chapterDocs`)
      return selectedId
    }
    
    return null
  }, [sessionId, chapterId, chapterDocs, activeTab])
  
  //  Déterminer le docType basé sur le courseType et activeTab
  const docType = useMemo(() => {
    if (effectiveCourseType === "exercice") return "exercise"
    if (effectiveCourseType === "cours") return "course"
    if (effectiveCourseType === "deep") {
      // Pour le mode deep, déterminer selon l'activeTab
      if (activeTab === "exercice" || activeTab === "evaluation") {
        return "exercise" as const
      }
      return "course" as const
    }
    return undefined // Fallback à auto-detect si vraiment on sait pas
  }, [effectiveCourseType, activeTab])

  // 🚀 Utiliser le cache React Query avec le bon docType
  const { data, isLoading: chatLoading } = useSessionCache(
    effectiveSessionId || null,
    docType,
    effectiveUserId || undefined,
    { enabled: !!effectiveSessionId && !!effectiveUserId && !!docType }
  )
  
  // Use courseType directly, will be forced to "deep" by provider if in modal
  const accent = useMemo(() => getCourseAccent(effectiveCourseType), [effectiveCourseType])

  // 🔄 Mettre à jour les messages quand le cache se charge
  useEffect(() => {
    if (data?.messages && Array.isArray(data.messages) && data.messages.length > 0) {
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
  }, [effectiveSessionId, effectiveUserId, activeTab])

  // 🔁 Fallback direct: si useSessionCache ne fournit rien, appeler getChat directement
  useEffect(() => {
    let mounted = true
    const tryFetch = async () => {
      if (!effectiveSessionId || !effectiveUserId) return
      try {
        console.log(`🔄 [CopiloteContainer] Fallback getChat fetch pour session=${effectiveSessionId} user=${effectiveUserId}`)
        const res = await getChat({ data: { user_id: effectiveUserId, session_id: effectiveSessionId } })
        if (!mounted) return
        
        // Vérifier que res est un array valide
        if (!res) {
          console.warn(`⚠️ [CopiloteContainer] getChat returned null/undefined`)
          return
        }
        
        if (!Array.isArray(res)) {
          console.warn(`⚠️ [CopiloteContainer] getChat returned non-array:`, typeof res, res)
          return
        }
        
        const texts = res
          .map((m: any) => {
            if (typeof m === 'string') return m
            if (m && typeof m === 'object' && m.text) return m.text
            return null
          })
          .filter(Boolean) as string[]
        
        setMessages(texts)
        setIsNewMessage(false)
        console.log(`✅ [CopiloteContainer] ${texts.length} messages chargés via getChat`) 
      } catch (err) {
        console.error("❌ [CopiloteContainer] Erreur getChat fallback:", err)
      }
    }

    tryFetch()
    return () => {
      mounted = false
    }
  }, [effectiveSessionId, effectiveUserId, activeTab])

  // 📜 Auto-scroll vers le bas quand les messages changent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const contentText = useMemo(() => {
    switch (effectiveCourseType) {
      case "exercice":
        return "les exercices"
      case "cours":
        return "le cours"
      case "deep":
        return "les cours approfondis"
      default:
        return "votre contenu"
    }
  }, [effectiveCourseType])

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
      console.log(`📤 [CopiloteContainer] sessionId: ${effectiveSessionId || "AUCUN"}`)
      
      const res = await sendChatWithRefresh({
        user_id: effectiveUserId,
        message: prompt,
        sessionId: effectiveSessionId || undefined, // 🔴 IMPORTANT: Passer le sessionId!
        // 🎯 Ajouter le contexte du Copilote basé sur courseType
        messageContext: {
          currentRoute: effectiveCourseType === "deep" ? "deep-course" : effectiveCourseType === "exercice" ? "exercice" : effectiveCourseType === "cours" ? "course" : "chat",
          deepCourseId: effectiveCourseType === "deep" ? (deepCourseId || undefined) : undefined,
          userFullName: session.name || undefined,
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
  }, [prompt, effectiveUserId, effectiveSessionId, activeTab, handleRedirect, effectiveCourseType, session, deepCourseId, sendChatWithRefresh])

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
  deepCourseId,
  chapterId,
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
          deepCourseId={deepCourseId}
          chapterId={chapterId}
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
      deepCourseId={deepCourseId}
      chapterId={chapterId}
    />
  )
}
