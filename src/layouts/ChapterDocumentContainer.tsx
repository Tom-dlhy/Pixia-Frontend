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

/**
 * Composant qui affiche dynamiquement les documents d'un chapitre
 * selon l'onglet actif (cours, exercice, évaluation)
 * 
 * Flux:
 * 1. Récupère les IDs des documents via useChapterDocuments
 * 2. Récupère les documents complets via useSessionCache
 * 3. Affiche le bon composant selon l'onglet actif
 */
export function ChapterDocumentContainer() {
  const { chapterId, activeTab } = useDeepCoursesLayout()
  const { session } = useAppSession()
  
  const userId = useMemo(() => {
    return session.userId ? String(session.userId) : undefined
  }, [session.userId])

  // 📌 Étape 1: Récupérer les IDs des documents du chapitre
  const { data: chapterDocs, isLoading: docsLoading } = useChapterDocuments(chapterId)

  // 📌 Déterminer quel ID de session utiliser selon l'onglet actif
  const sessionId = useMemo(() => {
    if (!chapterDocs) return null
    
    switch (activeTab) {
      case "cours":
        return chapterDocs.course_session_id || null
      case "exercice":
        return chapterDocs.exercice_session_id || null
      case "evaluation":
        return chapterDocs.evaluation_session_id || null
      default:
        return null
    }
  }, [chapterDocs, activeTab])

  // 📌 Mapper le nom de l'onglet français au type de document en anglais
  const docType = useMemo(() => {
    switch (activeTab) {
      case "cours":
        return "course" as const
      case "exercice":
        return "exercise" as const
      case "evaluation":
        return "exercise" as const // L'évaluation est un type d'exercice
      default:
        return undefined
    }
  }, [activeTab])

  // 📌 Étape 2: Récupérer le document complet selon l'onglet
  const { data, isLoading: docLoading, error } = useSessionCache(
    sessionId,
    docType,
    userId,
    { enabled: !!sessionId && !!userId }
  )
  
  const { document } = data

  // 🎯 États de chargement
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

  // 🎯 États d'erreur
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

  // 🎯 Afficher le bon composant selon le type
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
