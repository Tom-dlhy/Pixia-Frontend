"use client"

import { useMemo, type CSSProperties, useCallback, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "~/components/ui/button"
import CopiloteContainer from "~/layouts/CopiloteContainer"
import { cn } from "~/lib/utils"
import { useAppSession } from "~/utils/session"

interface CopiloteModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId?: string
  deepCourseId?: string
}

export function CopiloteModal({ isOpen, onClose, sessionId, deepCourseId }: CopiloteModalProps) {
  const { session } = useAppSession()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const userId = useMemo(() => {
    if (session.userId != null) {
      return String(session.userId)
    }
    return null
  }, [session.userId])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 transition-opacity duration-300",
          "bg-black/40 backdrop-blur-sm"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl h-[600px] rounded-[28px]">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-4 right-4 z-10",
              "text-white/70 hover:text-white hover:bg-white/10",
              "rounded-full transition-all duration-200"
            )}
            aria-label="Fermer le copilote"
          >
            <X className="h-5 w-5" />
          </Button>

          <CopiloteContainer
            className="w-full h-full"
            sessionId={sessionId}
            userId={userId}
            isCopiloteModal={true}
            forceDeepMode={true}
            deepCourseId={deepCourseId}
            onClose={onClose}
            onTextareaRef={(ref) => {
              if (ref) {
                textareaRef.current = ref
              }
            }}
          />
        </div>
      </div>
    </>
  )
}
