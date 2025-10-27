"use client"

import { useState, useMemo } from "react"
import { useParams } from "@tanstack/react-router"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Button } from "~/components/ui/button"
import { FileText, Menu } from "lucide-react"
import { useCourseType } from "~/context/CourseTypeContext"
import { useDocumentTitle } from "~/context/DocumentTitleContext"
import { useCourseContent } from "~/context/CourseContentContext"
import { useSessionCache } from "~/hooks/useSessionCache"
import { useAppSession } from "~/utils/session"
import { useDownloadPdf } from "~/hooks/useDownloadPdf"
import { cn } from "~/lib/utils"
import type { CourseWithChapters } from "~/models/Course"
import type { CourseOutput } from "~/models/Document"

export interface ChatActionButtonProps {
  contentRef?: React.RefObject<HTMLDivElement | null>
  sessionId?: string
}

export function ChatActionButton({ sessionId }: ChatActionButtonProps) {
  const { courseType } = useCourseType()
  const { title: documentTitle } = useDocumentTitle()
  const { course: contextCourse } = useCourseContent()
  const { session } = useAppSession()
  const { downloadPdf } = useDownloadPdf()
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)

  let courseId: string | undefined
  try {
    const courseParams = useParams({ from: "/_authed/course/$id" })
    courseId = courseParams.id as string | undefined
  } catch {
    courseId = undefined
  }

  const effectiveUserId = useMemo(() => {
    if (session.userId != null) {
      return String(session.userId)
    }
    return null
  }, [session.userId])

  const { data: sessionCacheData } = useSessionCache(
    courseId || null,
    "course",
    effectiveUserId || undefined,
    { enabled: !!courseId && !!effectiveUserId }
  )

  const courseData = useMemo((): CourseWithChapters | null => {
    const courseDocument = sessionCacheData?.document as CourseOutput | null
    if (courseDocument && courseDocument.chapters) {
      return {
        id: courseDocument.id || "",
        title: courseDocument.title || "Cours",
        chapters: courseDocument.chapters.map((ch: any) => ({
          id: ch.id_chapter || ch.id || Math.random().toString(),
          title: ch.title || "",
          content: ch.content || "",
          img_base64: ch.img_base64,
          schema_description: ch.schema_description,
          diagram_type: ch.diagram_type,
          diagram_code: ch.diagram_code,
          schemas: ch.schemas,
        })),
        type: "cours",
      }
    }

    if (contextCourse) {
      return contextCourse
    }

    return null
  }, [sessionCacheData, contextCourse])

  if (courseType === 'exercice' || courseType === 'deep') {
    return null
  }

  const handleExportPdf = async () => {
    if (!sessionId) {
      console.error('[ChatActionButton] Session ID not available')
      return
    }

    setIsDownloadingPdf(true)
    try {
      const filename = `${documentTitle || 'cours'}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`
      await downloadPdf(sessionId, filename)
    } catch (error) {
      console.error('[ChatActionButton] Erreur lors du téléchargement PDF:', error)
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  const accentMap: Record<string, { light: string; dark: string }> = {
    none: { light: "rgba(209,213,219,0.3)", dark: "rgba(82,82,91,0.25)" },
    cours: { light: "rgba(167,243,208,0.25)", dark: "rgba(16,185,129,0.25)" },
    exercice: { light: "rgba(147,197,253,0.25)", dark: "rgba(56,189,248,0.25)" },
    deep: { light: "rgba(216,180,254,0.25)", dark: "rgba(139,92,246,0.25)" },
  }

  const accent = accentMap[courseType] ?? accentMap["none"]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            "flex items-center gap-2 rounded-md cursor-pointer transition-all duration-300 text-foreground",
            "border border-white/30 dark:border-white/10 backdrop-blur-md backdrop-saturate-150",
            "bg-[rgba(255,255,255,0.25)] dark:bg-[rgba(24,24,27,0.35)]",
            "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.1)]",
            "hover:scale-[1.03]"
          )}
          style={{
            background: `linear-gradient(135deg, ${accent.light}, transparent 80%)`,
          }}
        >
          <Menu className="h-4 w-4 opacity-90" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn(
          "min-w-56 rounded-xl border border-white/20 dark:border-white/10 p-2",
          "backdrop-blur-xl backdrop-saturate-150",
          "bg-[rgba(255,255,255,0.2)] dark:bg-[rgba(24,24,27,0.4)]",
          "shadow-[inset_0_1px_3px_rgba(255,255,255,0.2),0_8px_30px_rgba(0,0,0,0.25)]"
        )}
        side="bottom"
        align="end"
        sideOffset={8}
      >
        {[
          {
            label: "Enregistrer en PDF",
            icon: FileText,
            action: handleExportPdf,
          },
        ].map(({ label, icon: Icon, action }, idx, arr) => (
          <div key={label}>
            <Button
              variant="ghost"
              onClick={action}
              disabled={label === "Enregistrer en PDF" && isDownloadingPdf}
              className={cn(
                "w-full justify-start gap-2 text-foreground rounded-md transition-all duration-300",
                "border border-transparent",
                "hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_4px_10px_rgba(0,0,0,0.1)]"
              )}
              style={{
                background: `linear-gradient(135deg, transparent, transparent)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${accent.light}, ${accent.dark})`
                e.currentTarget.style.backdropFilter = "blur(16px) saturate(150%)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, transparent, transparent)`
                e.currentTarget.style.backdropFilter = "blur(10px) saturate(100%)"
              }}
            >
              <Icon className="h-4 w-4 opacity-80" />
              {label === "Enregistrer en PDF" && isDownloadingPdf ? "Téléchargement..." : label}
            </Button>

            {idx < arr.length - 1 && (
              <DropdownMenuSeparator className="my-1 opacity-20" />
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
