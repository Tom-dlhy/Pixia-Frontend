"use client"

import { useRef, useState, useMemo } from "react"
import { useParams } from "@tanstack/react-router"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Button } from "~/components/ui/button"
import { Plus, Trash2, Menu, FileText, FileCode } from "lucide-react"
import { FaCheckCircle } from "react-icons/fa"
import { useCourseType } from "~/context/CourseTypeContext"
import { useDocumentTitle } from "~/context/DocumentTitleContext"
import { useCourseContent } from "~/context/CourseContentContext"
import { useSessionCache } from "~/hooks/useSessionCache"
import { useAppSession } from "~/utils/session"
import { generatePdfFromCourseData } from "~/utils/generatePdfFromCourseData"
import { generateMarkdownFromCourseData } from "~/utils/generateMarkdownFromCourseData"
import { cn } from "~/lib/utils"
import { markChapterCompleteServerFn, markChapterUncompleteServerFn } from "~/server/chat.server"
import type { CourseWithChapters } from "~/models/Course"
import type { CourseOutput } from "~/models/Document"

interface ActionButtonProps {
  viewLevel?: "root" | "course" | "chapter"
  chapterId?: string
  isChapterComplete?: boolean
  onCreateCourse?: () => void
  onAddChapter?: () => void
  onDeleteCourse?: () => void
  onDeleteChapter?: () => void
  onMarkDone?: () => void
}

export default function ActionButton({
  viewLevel = "root",
  chapterId,
  isChapterComplete = false,
  onCreateCourse,
  onAddChapter,
  onDeleteCourse,
  onDeleteChapter,
  onMarkDone,
}: ActionButtonProps) {
  const { courseType } = useCourseType()
  
  let documentTitle: string | null = null
  try {
    const titleContext = useDocumentTitle()
    documentTitle = titleContext.title
  } catch {
    // DocumentTitleProvider not available in this context
  }

  let contextCourse = null
  try {
    const courseContext = useCourseContent()
    contextCourse = courseContext.course
  } catch {
    // CourseContentProvider not available in this context
  }

  let session: any = { userId: null }
  try {
    const sessionContext = useAppSession()
    session = sessionContext.session
  } catch {
    // useAppSession not available in this context
  }

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

  const handleExportPdf = async () => {
    if (!courseData) {
      console.error('[ActionButton] Course data not available')
      return
    }

    const filename = `${documentTitle || 'export'}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`
    
    await generatePdfFromCourseData(courseData, filename)
  }

  const handleExportMarkdown = () => {
    if (!courseData) {
      console.error('[ActionButton] Course data not available')
      return
    }

    const filename = `${documentTitle || 'export'}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.md`
    
    generateMarkdownFromCourseData(courseData, filename)
  }

  const accentMap: Record<
    string,
    {
      light: string
      dark: string
      lightHover: string
      darkHover: string
    }
  > = {
    none: {
      light: "rgba(229,231,235,0.3)",
      dark: "rgba(82,82,91,0.25)",
      lightHover: "rgba(209,213,219,0.45)",
      darkHover: "rgba(113,113,122,0.35)",
    },
    cours: {
      light: "rgba(167,243,208,0.25)",
      dark: "rgba(16,185,129,0.25)",
      lightHover: "rgba(110,231,183,0.35)",
      darkHover: "rgba(5,150,105,0.35)",
    },
    exercice: {
      light: "rgba(147,197,253,0.25)",
      dark: "rgba(56,189,248,0.25)",
      lightHover: "rgba(96,165,250,0.35)",
      darkHover: "rgba(14,165,233,0.35)",
    },
    deep: {
      light: "rgba(216,180,254,0.25)",
      dark: "rgba(139,92,246,0.25)",
      lightHover: "rgba(192,132,252,0.35)",
      darkHover: "rgba(124,58,237,0.35)",
    }
  }

  const accent = accentMap[courseType] ?? accentMap["none"]

  if (viewLevel === "root" && onCreateCourse) {
    return (
      <Button
        variant="secondary"
        size="icon"
        onClick={onCreateCourse}
        className={cn(
          "flex items-center gap-2 rounded-md cursor-pointer transition-all duration-300 text-foreground",
          "border border-white/30 dark:border-white/10 backdrop-blur-md backdrop-saturate-150",
          "bg-[rgba(255,255,255,0.25)] dark:bg-[rgba(24,24,27,0.35)]",
          "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.1)] hover:scale-[1.03]"
        )}
        style={{
          background: `linear-gradient(135deg, ${accent.light}, transparent 80%)`,
        }}
      >
        <Plus className="h-4 w-4 opacity-90" />
      </Button>
    )
  }

  if (viewLevel === "course") {
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
              "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.1)] hover:scale-[1.03]"
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
          {onAddChapter && (
            <Button
              variant="ghost"
              onClick={onAddChapter}
              className={cn(
                "relative w-full justify-start gap-2 rounded-md transition-all duration-300 text-green-600 dark:text-green-400",
                "hover:scale-[1.02]",
                "before:absolute before:inset-0 before:rounded-md before:opacity-0 before:-z-10 before:transition-opacity before:duration-300",
                "hover:before:opacity-100"
              )}
              style={{
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${
                  document.documentElement.classList.contains("dark")
                    ? accent.darkHover
                    : accent.lightHover
                }, ${
                  document.documentElement.classList.contains("dark")
                    ? "rgba(5,150,105,0.3)"
                    : "rgba(134,239,172,0.3)"
                })`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
              }}
            >
              <Plus className="h-4 w-4 opacity-80" />
              Ajouter un chapitre
            </Button>
          )}

          {onDeleteCourse && (
            <>
              <DropdownMenuSeparator className="my-1 opacity-20" />
              <Button
                variant="ghost"
                onClick={onDeleteCourse}
                className={cn(
                  "relative w-full justify-start gap-2 rounded-md transition-all duration-300 text-red-600 dark:text-red-400",
                  "hover:scale-[1.02]"
                )}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${
                    document.documentElement.classList.contains("dark")
                      ? "rgba(239,68,68,0.3)"
                      : "rgba(252,165,165,0.3)"
                  }, ${
                    document.documentElement.classList.contains("dark")
                      ? "rgba(127,29,29,0.3)"
                      : "rgba(248,113,113,0.3)"
                  })`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                }}
              >
                <Trash2 className="h-4 w-4 opacity-80" />
                Supprimer le cours
              </Button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (viewLevel === "chapter") {
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
              "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.1)] hover:scale-[1.03]"
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
          {courseData && (
            <>
              <Button
                variant="ghost"
                onClick={handleExportPdf}
                className={cn(
                  "w-full justify-start gap-2 text-foreground rounded-md transition-all duration-300",
                  "border border-transparent",
                  "hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_4px_10px_rgba(0,0,0,0.1)]"
                )}
                style={{
                  background: `linear-gradient(135deg, transparent, transparent)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, rgba(167,243,208,0.25), rgba(16,185,129,0.25))`
                  e.currentTarget.style.backdropFilter = "blur(16px) saturate(150%)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, transparent, transparent)`
                  e.currentTarget.style.backdropFilter = "blur(10px) saturate(100%)"
                }}
              >
                <FileText className="h-4 w-4 opacity-80" />
                Enregistrer en PDF
              </Button>

              <DropdownMenuSeparator className="my-1 opacity-20" />

              <Button
                variant="ghost"
                onClick={handleExportMarkdown}
                className={cn(
                  "w-full justify-start gap-2 text-foreground rounded-md transition-all duration-300",
                  "border border-transparent",
                  "hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_4px_10px_rgba(0,0,0,0.1)]"
                )}
                style={{
                  background: `linear-gradient(135deg, transparent, transparent)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, rgba(167,243,208,0.25), rgba(16,185,129,0.25))`
                  e.currentTarget.style.backdropFilter = "blur(16px) saturate(150%)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, transparent, transparent)`
                  e.currentTarget.style.backdropFilter = "blur(10px) saturate(100%)"
                }}
              >
                <FileCode className="h-4 w-4 opacity-80" />
                Enregistrer en Markdown
              </Button>

              <DropdownMenuSeparator className="my-1 opacity-20" />
            </>
          )}

          {onMarkDone && (
            <Button
              variant="ghost"
              onClick={async () => {
                try {
                  if (!chapterId) {
                    console.error(`[ActionButton] chapterId manquant`)
                    return
                  }
                  
                  const newCompleteState = !isChapterComplete
                  
                  if (!isChapterComplete) {
                    await markChapterCompleteServerFn({ data: { chapter_id: chapterId } })
                  } else {
                    await markChapterUncompleteServerFn({ data: { chapter_id: chapterId } })
                  }
                  
                  localStorage.setItem(`chapter-complete-${chapterId}`, String(newCompleteState))
                  
                  if (onMarkDone) {
                    onMarkDone()
                  }
                } catch (error) {
                  console.error(`[ActionButton] Erreur lors de l'opération:`, error)
                }
              }}
              className={cn(
                "w-full justify-start gap-2 rounded-md transition-all duration-300",
                isChapterComplete
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-green-600 dark:text-green-400",
                "hover:scale-[1.02]"
              )}
              onMouseEnter={(e) => {
                const isDark = document.documentElement.classList.contains("dark")
                const gradientFrom = isChapterComplete
                  ? isDark ? "rgba(59,130,246,0.25)" : "rgba(147,197,253,0.25)"
                  : isDark ? "rgba(34,197,94,0.25)" : "rgba(110,231,183,0.25)"
                const gradientTo = isChapterComplete
                  ? isDark ? "rgba(37,99,235,0.25)" : "rgba(96,165,250,0.25)"
                  : isDark ? "rgba(5,150,105,0.25)" : "rgba(74,222,128,0.25)"
                e.currentTarget.style.background = `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
              }}
            >
              <FaCheckCircle className="h-4 w-4 opacity-80" />
              {isChapterComplete ? "Reprendre le cours" : "Marquer comme terminé"}
            </Button>
          )}

          {onDeleteChapter && (
            <>
              <DropdownMenuSeparator className="my-1 opacity-20" />
              <Button
                variant="ghost"
                onClick={onDeleteChapter}
                className={cn(
                  "w-full justify-start gap-2 rounded-md transition-all duration-300 text-red-600 dark:text-red-400",
                  "hover:scale-[1.02]"
                )}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${
                    document.documentElement.classList.contains("dark")
                      ? "rgba(239,68,68,0.3)"
                      : "rgba(252,165,165,0.3)"
                  }, ${
                    document.documentElement.classList.contains("dark")
                      ? "rgba(127,29,29,0.3)"
                      : "rgba(248,113,113,0.3)"
                  })`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                }}
              >
                <Trash2 className="h-4 w-4 opacity-80" />
                Supprimer le chapitre
              </Button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return null
}
