"use client"

import { useMemo, useEffect, useRef } from "react"
import { useNavigate, useLocation, useParams } from "@tanstack/react-router"
import { ScrollArea } from "~/components/ui/scroll-area"
import ChatHeader from "~/layouts/ChatHeader"
import CopiloteContainer from "~/layouts/CopiloteContainer"
import BackButton from "~/components/BackButton"
import { ChatActionButton } from "~/components/ChatActionButton"
import { useCourseType, type CourseType } from "~/context/CourseTypeContext"
import { useDocumentTitle } from "~/context/DocumentTitleContext"
import { useAppSession } from "~/utils/session"

interface ChatQuickViewLayoutProps {
  children: React.ReactNode
  title?: string
  backTo?: string
  courseType?: CourseType
}

export function ChatQuickViewLayout({ 
  children, 
  title = "", 
  backTo = "/chat",
  courseType: overrideCourseType
}: ChatQuickViewLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { courseType: contextCourseType, setCourseType } = useCourseType()
  const { title: documentTitle } = useDocumentTitle()
  const { session } = useAppSession()
  const contentRef = useRef<HTMLDivElement>(null)
  let courseId: string | undefined
  let exerciseId: string | undefined
  
  try {
    const courseParams = useParams({ from: "/_authed/course/$id" })
    courseId = courseParams.id as string | undefined
  } catch {
    courseId = undefined
  }
  
  try {
    const exerciseParams = useParams({ from: "/_authed/exercise/$id" })
    exerciseId = exerciseParams.id as string | undefined
  } catch {
    exerciseId = undefined
  }
  
  const routeId = courseId || exerciseId
  const courseType = overrideCourseType || contextCourseType
  useEffect(() => {
    if (overrideCourseType && overrideCourseType !== contextCourseType) {
      setCourseType(overrideCourseType)
    }
  }, [overrideCourseType, contextCourseType, setCourseType])

  const sessionId = useMemo(() => {
    if (routeId) {
      return routeId
    }
    
    const pathSegments = location.pathname.split("/").filter(Boolean)
    
    for (let i = 0; i < pathSegments.length; i++) {
      if ((pathSegments[i] === "course" || pathSegments[i] === "exercise") && pathSegments[i + 1]) {
        const id = pathSegments[i + 1]
        return id
      }
    }
    
    return null
  }, [routeId, location.pathname])
  
  const userId = useMemo(() => {
    if (session.userId != null) {
      return String(session.userId)
    }
    return null
  }, [session.userId])

  const formattedSession = useMemo(() => {
    if (!sessionId) return "Session"
    if (sessionId.startsWith("chat-")) return `Chat ${sessionId.split("chat-")[1]}`
    return sessionId
  }, [sessionId])

  const displayTitle = documentTitle || title

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-sidebar text-sidebar-foreground">
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <div className="flex-shrink-0 px-10 pt-10 pb-4">
          <ChatHeader
            title={displayTitle}
            leftAction={<BackButton onClick={() => navigate({ to: backTo })} />}
            rightAction={<ChatActionButton contentRef={contentRef} />}
          />
        </div>

        <div className="flex flex-1 gap-6 overflow-hidden px-10 pb-10 pt-6 min-h-0">
          <div
            ref={contentRef}
            className="
              flex flex-[0.7] flex-col overflow-hidden
              rounded-[28px] border border-white/20 dark:border-white/10
              bg-[rgba(255,255,255,0.15)] dark:bg-[rgba(24,24,27,0.45)]
              backdrop-blur-xl backdrop-saturate-150
              shadow-[inset_0_1px_3px_rgba(255,255,255,0.3),0_12px_40px_rgba(0,0,0,0.25)]
              transition-all duration-300 p-6
            "
          >
            <ScrollArea className="h-full w-full rounded-lg">
              <div className="pr-4">
                <div className="mt-2">{children}</div>
              </div>
            </ScrollArea>
          </div>

          <div className="flex flex-[0.3] flex-col overflow-hidden min-h-0">
            <CopiloteContainer sessionId={sessionId} userId={userId} courseType={courseType} />
          </div>
        </div>
      </div>
    </div>
  )
}
