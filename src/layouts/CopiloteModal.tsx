"use client"

import { type CSSProperties, useCallback, useMemo } from "react"
import { X } from "lucide-react"
import { Button } from "~/components/ui/button"
import CopiloteContainer from "~/layouts/CopiloteContainer"
import { useCourseType } from "~/context/CourseTypeContext"
import { getCourseAccent } from "~/utils/courseTypeStyles"
import { cn } from "~/lib/utils"
import { useAppSession } from "~/utils/session"

interface CopiloteModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId?: string
}

export function CopiloteModal({ isOpen, onClose, sessionId }: CopiloteModalProps) {
  const { courseType } = useCourseType()
  const { session } = useAppSession()
  // Force "deep" mode pour le modal
  const accent = useMemo(() => getCourseAccent("none"), [])
  
  // 🔹 Récupération du userId depuis la session
  const userId = useMemo(() => {
    if (session.userId != null) {
      return String(session.userId)
    }
    return null
  }, [session.userId])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop floutée */}
      <div
        className={cn(
          "fixed inset-0 z-40 transition-opacity duration-300",
          "bg-black/40 backdrop-blur-sm"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal centré */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl h-[600px] rounded-[28px]">
          {/* Bouton fermeture */}
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

          {/* Copilote Container */}
          <CopiloteContainer
            className="w-full h-full"
            sessionId={sessionId}
            userId={userId}
            isCopiloteModal={true}
            forceDeepMode={true}
          />
        </div>
      </div>
    </>
  )
}
