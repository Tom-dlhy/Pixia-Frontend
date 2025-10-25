"use client"

import { useMemo, type CSSProperties } from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { ChatActionButton } from "~/components/ChatActionButton"
import { Button } from "~/components/ui/button"
import { useCourseType } from "~/context/CourseTypeContext"
import { getCourseAccent } from "~/utils/courseTypeStyles"
import { cn } from "~/lib/utils"

interface ChatHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  showActionsMenu?: boolean
  onBack?: () => void
  className?: string
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
}

export default function ChatHeader({
  title,
  subtitle,
  showBackButton = false,
  showActionsMenu = false,
  onBack,
  className,
  leftAction,
  rightAction,
}: ChatHeaderProps) {
  const navigate = useNavigate()
  const { courseType } = useCourseType()
  const accent = useMemo(() => getCourseAccent(courseType === "deep" ? "none" : courseType), [courseType])

  const headingStyle = useMemo(() => ({
    backgroundImage: accent.gradient,
    backgroundSize: "300% 300%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
    animation: "neon-flow 12s linear infinite",
  }) as CSSProperties, [accent])

  const handleBack = () => {
    if (onBack) onBack()
    else navigate({ to: "/chat" })
  }

  return (
    <header
      className={cn(
        "flex flex-col gap-3 border-b border-border/40 bg-background/80 backdrop-blur-sm px-10 pt-6 pb-4",
        className
      )}
    >
      <div className="grid grid-cols-3 items-center">
        <div className="flex items-center gap-2 justify-start">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          )}
          {leftAction}
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-semibold leading-tight" style={headingStyle}>{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 justify-end">
          {rightAction}
          {showActionsMenu && <ChatActionButton />}
        </div>
      </div>
    </header>
  )
}
