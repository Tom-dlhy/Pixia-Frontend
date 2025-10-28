"use client"

import React, { useState, useCallback, useMemo, useEffect, useRef, type CSSProperties, forwardRef } from "react"
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
  onClose?: () => void
  onTextareaRef?: (ref: HTMLTextAreaElement | null) => void
}

function CopiloteContainerContent({
  className = "",
  sessionId,
  userId,
  courseType, 
  isCopiloteModal = false,
  deepCourseId,
  chapterId,
  onClose,
  onTextareaRef,
}: Omit<CopiloteContainerProps, "forceDeepMode">) {
  const [prompt, setPrompt] = useState("")
  const [messages, setMessages] = useState<string[]>([])
  const [isNewMessage, setIsNewMessage] = useState(false)
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [copiloteSessionId, setCopiloteSessionId] = useState<string | null>(sessionId || null)
  const [queuedFiles, setQueuedFiles] = useState<File[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { courseType: contextCourseType } = useCourseType()
  const effectiveCourseType = courseType || contextCourseType
  const { session } = useAppSession()
  const { handleRedirect } = useApiRedirect()
  const { send: sendChatWithRefresh } = useSendChatWithRefresh()

  useEffect(() => {
    if (onTextareaRef && textareaRef.current) {
      onTextareaRef(textareaRef.current)
    }
  }, [onTextareaRef])
  
  let activeTab: "cours" | "exercice" | "evaluation" | null = null
  try {
    const deepContext = useDeepCoursesLayout()
    activeTab = deepContext.activeTab
  } catch {
    activeTab = null
  }
  
  const effectiveUserId = useMemo(() => {
    if (userId) {
      return userId
    }
    if (session.userId != null) {
      const sessionUserId = String(session.userId)
      return sessionUserId
    }
    console.warn(`[CopiloteContainer] Session pas encore hydratée, userId = ${session.userId}`)
    return null
  }, [userId, session.userId])

  const { data: chapterDocs } = useChapterDocuments(chapterId || undefined)
  
  const effectiveSessionId = useMemo(() => {
    if (sessionId && !chapterId) {
      return sessionId
    }
    
    if (chapterId && chapterDocs) {
      let selectedId: string | null = null
      
      if (activeTab === "cours") {
        selectedId = chapterDocs.course_session_id || null
      } else if (activeTab === "exercice") {
        selectedId = chapterDocs.exercice_session_id || null
      } else if (activeTab === "evaluation") {
        selectedId = chapterDocs.evaluation_session_id || null
      } else {
        selectedId = chapterDocs.course_session_id || null
      }
      
      return selectedId
    }
    
    return null
  }, [sessionId, chapterId, chapterDocs, activeTab])
  
  const accent = useMemo(() => getCourseAccent(effectiveCourseType), [effectiveCourseType])

  // Fetch chat messages quand la session change
  useEffect(() => {
    let mounted = true
    const tryFetch = async () => {
      if (!effectiveSessionId || !effectiveUserId) return
      try {
        const res = await getChat({ data: { user_id: effectiveUserId, session_id: effectiveSessionId } })
        if (!mounted) return
        
        if (!res) {
          console.warn(`[CopiloteContainer] getChat returned null/undefined`)
          return
        }
        
        if (!Array.isArray(res)) {
          console.warn(`[CopiloteContainer] getChat returned non-array:`, typeof res, res)
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
      } catch (err) {
        console.error("[CopiloteContainer] Erreur getChat fallback:", err)
      }
    }

    tryFetch()
    return () => {
      mounted = false
    }
  }, [effectiveSessionId, effectiveUserId, activeTab])

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

  const handleFilesSelected = (files: File[]) => {
    if (files.length) setQueuedFiles(files)
  }

  const removeAttachment = (index: number) => {
    setQueuedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() && queuedFiles.length === 0) {
      return
    }
    if (!effectiveUserId) {
      if (!effectiveUserId) {
        console.warn(`[CopiloteContainer] Impossible d'envoyer: userId non disponible`)
      }
      return
    }
    
    const userMessage = prompt.trim()
    
    try {
      setMessages((m) => [...m, userMessage, ""])
      setPrompt("")
      setIsNewMessage(true)
      setIsWaitingForResponse(true)

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

      let agentIndication: "chat" | "deepCourse" | "cours" | "exercice" | "copiloteCours" | "copiloteExercice" | "copiloteNouveauCours"
      if (effectiveCourseType === "deep") {
        agentIndication = deepCourseId && !chapterId ? "copiloteNouveauCours" : "deepCourse"
      } else if (effectiveCourseType === "exercice") {
        agentIndication = "copiloteExercice"
      } else if (effectiveCourseType === "cours") {
        agentIndication = "copiloteCours"
      } else {
        agentIndication = "chat"
      }

      const res = await sendChatWithRefresh({
        user_id: effectiveUserId,
        message: userMessage,
        files: encodedFiles.length ? encodedFiles : undefined,
        sessionId: copiloteSessionId || undefined,
        deepCourseId: effectiveCourseType === "deep" ? (deepCourseId || undefined) : undefined,
        messageContext: {
          agentIndication,
          deepCourseId: effectiveCourseType === "deep" ? (deepCourseId || undefined) : undefined,
          userFullName: session.name || undefined,
          userStudy: session.study || undefined,
        },
      })

      if (res.session_id && res.session_id !== copiloteSessionId) {
        setCopiloteSessionId(res.session_id)
      }

      setMessages((m) => {
        const newMessages = [...m]
        newMessages[newMessages.length - 1] = res.reply
        return newMessages
      })
      setIsWaitingForResponse(false)
      setQueuedFiles([])

      handleRedirect(res, onClose)
    } catch (err) {
      console.error("Erreur Copilote:", err)
      setMessages((m) => {
        const newMessages = [...m]
        newMessages[newMessages.length - 1] = "Erreur lors de la requête"
        return newMessages
      })
      setIsWaitingForResponse(false)
      setQueuedFiles([])
    }
  }, [prompt, effectiveUserId, copiloteSessionId, activeTab, handleRedirect, effectiveCourseType, session, deepCourseId, sendChatWithRefresh, onClose, queuedFiles])

  return (
    <aside
      className={cn(
        `
        flex flex-col h-full
        rounded-[28px] border border-white/20 dark:border-white/10
        backdrop-blur-xl backdrop-saturate-150
        bg-[rgba(255,255,255,0.15)] dark:bg-[rgba(24,24,27,0.45)]
        shadow-[inset_0_1px_3px_rgba(255,255,255,0.3)]
        filter drop-shadow(0 8px 20px rgba(0,0,0,0.25))
        transition-all duration-300
        p-6 overflow-hidden
      `,
        !isCopiloteModal && "hidden md:flex",
        className
      )}
    >
      <div className="flex flex-col gap-4 overflow-hidden flex-1 min-h-0">
        <div>
          <h2 className="text-lg font-semibold" style={headingStyle}>
            Copilote
          </h2>
        </div>

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

      <ChatInput
        ref={textareaRef}
        value={prompt}
        onChange={setPrompt}
        onSubmit={handleSubmit}
        disableAttachments={false}
        isSending={isWaitingForResponse}
        className="flex-shrink-0"
        placeholder="Demandez une assistance au copilote..."
        queuedFiles={queuedFiles}
        onFilesSelected={handleFilesSelected}
        onRemoveAttachment={removeAttachment}
      />
    </aside>
  )
}

function ForcedDeepModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <CourseTypeProvider>
      <ForcedDeepModeWrapper>{children}</ForcedDeepModeWrapper>
    </CourseTypeProvider>
  )
}

function ForcedDeepModeWrapper({ children }: { children: React.ReactNode }) {
  const { setCourseType } = useCourseType()
  useEffect(() => {
    setCourseType("deep")
  }, [setCourseType])
  return <>{children}</>
}

export default function CopiloteContainer({
  className = "",
  sessionId,
  userId,
  isCopiloteModal = false,
  forceDeepMode = false,
  deepCourseId,
  chapterId,
  onClose,
  onTextareaRef,
}: CopiloteContainerProps) {
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
          onClose={onClose}
          onTextareaRef={onTextareaRef}
        />
      </ForcedDeepModeProvider>
    )
  }

  return (
    <CopiloteContainerContent
      className={className}
      sessionId={sessionId}
      userId={userId}
      isCopiloteModal={isCopiloteModal}
      deepCourseId={deepCourseId}
      chapterId={chapterId}
      onClose={onClose}
      onTextareaRef={onTextareaRef}
    />
  )
}
