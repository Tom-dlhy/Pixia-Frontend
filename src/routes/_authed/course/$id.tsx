'use client'

import { createFileRoute } from '@tanstack/react-router'
import { useParams } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useSessionCache } from '~/hooks/useSessionCache'
import { useCourseContent } from '~/context/CourseContentContext'
import { useDocumentTitle } from '~/context/DocumentTitleContext'
import { useAppSession } from '~/utils/session'
import { Spinner } from '~/components/ui/spinner'
import { AlertCircle } from 'lucide-react'
import { CourseViewer } from '~/components/viewers/CourseViewer'
import { ExerciseViewer } from '~/components/viewers/ExerciseViewer'
import { isCourseOutput, isExerciseOutput, CourseOutput } from '~/models/Document'
import { CourseWithChapters, Chapter } from '~/models/Course'

export const Route = createFileRoute('/_authed/course/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = useParams({ from: '/_authed/course/$id' })
  const { session } = useAppSession()
  
  // 🚀 Utiliser le cache au lieu de refaire des appels API
  const { data, isLoading, error } = useSessionCache(
    id,
    'course',
    session.userId ? String(session.userId) : undefined,
    { enabled: !!id } // Activer quand on a un ID
  )
  
  const { document, documentType } = data
  const { setCourse } = useCourseContent()
  const { setTitle } = useDocumentTitle()

  // Mettre à jour le contexte quand le document se charge
  useEffect(() => {
    if (document && isCourseOutput(document)) {
      const courseDoc = document as CourseOutput
      
      // Utiliser 'parts' en fallback si 'chapters' n'est pas disponible
      const chapters = courseDoc.chapters || courseDoc.parts || []
      
      // Convertir CourseOutput en CourseWithChapters
      const courseData: CourseWithChapters = {
        id: courseDoc.id || id,
        title: courseDoc.title || "Cours",
        chapters: chapters.map((ch: any): Chapter => ({
          id: ch.id_chapter || Math.random().toString(),
          title: ch.title || "",
          content: ch.content || "",
          img_base64: ch.img_base64 || undefined,
          schema_description: ch.schema_description || undefined,
        })),
        type: "cours",
      }
      
      setCourse(courseData)
      setTitle(courseData.title)
      
      console.log("✅ [course.$id] Course data set in context:", courseData)
      console.log("📊 [course.$id] Chapters with images:", courseData.chapters.map(c => ({ title: c.title, hasImage: !!c.img_base64 })))
    }
  }, [document, id, setCourse, setTitle])

  if (isLoading) {
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
          <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : String(error)}</p>
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

  // 🎯 Afficher le bon composant selon le type avec type guards
  if (isExerciseOutput(document)) {
    return <ExerciseViewer exercise={document} />
  }

  if (isCourseOutput(document)) {
    return <CourseViewer course={document} />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-2xl font-bold">Contenu de la course</div>
      <div className="text-sm text-muted-foreground">ID: {id}</div>
      <p className="text-sm text-muted-foreground">Type: {documentType}</p>
    </div>
  )
}
