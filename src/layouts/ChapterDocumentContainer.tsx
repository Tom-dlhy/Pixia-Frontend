"use client"

import { useMemo } from "react"
import { Spinner } from "~/components/ui/spinner"
import { AlertCircle } from "lucide-react"
import { CourseViewer } from "~/components/viewers/CourseViewer"
import { ExerciseViewer } from "~/components/viewers/ExerciseViewer"
import { isCourseOutput, isExerciseOutput } from "~/models/Document"
import { useSessionCache } from "~/hooks/useSessionCache"
import { useChapterDocuments } from "~/hooks/useChapterDocuments"
import { useDeepCoursesLayout } from "~/layouts/DeepCourseContext"
import { useAppSession } from "~/utils/session"
import { DocumentTitleProvider } from "~/context/DocumentTitleContext"

export function ChapterDocumentContainer() {
  const { chapterId, activeTab } = useDeepCoursesLayout()
  const { session } = useAppSession()
  
  const userId = useMemo(() => {
    return session.userId ? String(session.userId) : undefined
  }, [session.userId])

  const memoizedChapterId = useMemo(() => chapterId, [chapterId])
  const memoizedActiveTab = useMemo(() => activeTab, [activeTab])

  const { data: chapterDocs, isLoading: docsLoading } = useChapterDocuments(
    memoizedChapterId,
    { enabled: !!memoizedChapterId && !!userId }
  )

  const sessionId = useMemo(() => {
    if (!chapterDocs) {
      console.warn(`[ChapterDocumentContainer] chapterDocs not available yet`)
      return null
    }
    
    let selectedId: string | null = null
    switch (memoizedActiveTab) {
      case "cours":
        selectedId = chapterDocs.course_session_id || null
        break
      case "exercice":
        selectedId = chapterDocs.exercice_session_id || null
        break
      case "evaluation":
        selectedId = chapterDocs.evaluation_session_id || null
        break
      default:
        selectedId = null
    }
    
    return selectedId
  }, [chapterDocs, memoizedActiveTab, memoizedChapterId])

  const docType = useMemo(() => {
    switch (memoizedActiveTab) {
      case "cours":
        return "course" as const
      case "exercice":
        return "exercise" as const
      case "evaluation":
        return "exercise" as const
      default:
        return undefined
    }
  }, [memoizedActiveTab])

  const { data, isLoading: docLoading, error } = useSessionCache(
    sessionId,
    docType,
    userId,
    { enabled: !!sessionId && !!userId }
  )
  
  const { document } = data

  if (docsLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Spinner className="size-8" />
        <p className="text-sm text-muted-foreground">Chargement des documents du chapitre...</p>
      </div>
    )
  }

  if (docLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Spinner className="size-8" />
        <p className="text-sm text-muted-foreground">Chargement du contenu...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <AlertCircle className="size-8 text-destructive" />
        <div className="text-center">
          <p className="font-semibold text-sm">Erreur lors du chargement</p>
          <p className="text-xs text-muted-foreground">
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      </div>
    )
  }

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <AlertCircle className="size-8 text-muted-foreground" />
        <div className="text-center">
          <p className="font-semibold text-sm">Aucun document disponible</p>
          <p className="text-xs text-muted-foreground">
            {activeTab === "cours" && "Aucun cours disponible pour ce chapitre"}
            {activeTab === "exercice" && "Aucun exercice disponible pour ce chapitre"}
            {activeTab === "evaluation" && "Aucune évaluation disponible pour ce chapitre"}
          </p>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-sm text-muted-foreground">Aucun contenu disponible</p>
      </div>
    )
  }

  if (isExerciseOutput(document)) {
    return (
      <DocumentTitleProvider>
        <ExerciseViewer exercise={document} />
      </DocumentTitleProvider>
    )
  }

  if (isCourseOutput(document)) {
    return (
      <DocumentTitleProvider>
        <CourseViewer course={document} />
      </DocumentTitleProvider>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-muted-foreground">
        Contenu non reconnu - Type: {typeof document}
      </div>
    </div>
  )
}
