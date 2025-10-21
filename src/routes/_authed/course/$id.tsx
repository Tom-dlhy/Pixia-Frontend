'use client'

import { createFileRoute } from '@tanstack/react-router'
import { useParams } from '@tanstack/react-router'
import { useChatWithDocument } from '~/hooks/useDocument'
import { Spinner } from '~/components/ui/spinner'
import { AlertCircle } from 'lucide-react'
import { CourseViewer } from '~/components/viewers/CourseViewer'
import { ExerciseViewer } from '~/components/viewers/ExerciseViewer'
import { isCourseOutput, isExerciseOutput } from '~/models/Document'

export const Route = createFileRoute('/_authed/course/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = useParams({ from: '/_authed/course/$id' })
  
  const { document, documentType, loading, error } = useChatWithDocument(id, 'course')

  if (loading) {
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
