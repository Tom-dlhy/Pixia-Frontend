'use client'

import { useEffect } from 'react'
import { CourseOutput } from '~/models/Document'
import { ScrollArea } from '~/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'
import { useDocumentTitle } from '~/context/DocumentTitleContext'

interface CourseViewerProps {
  course: CourseOutput
}

/**
 * Affiche le contenu d'une course (chapitres, sections, etc)
 */
export function CourseViewer({ course }: CourseViewerProps) {
  const { setTitle } = useDocumentTitle()
  
  // Set the document title in context when component mounts or course changes
  useEffect(() => {
    setTitle(course.title || null)
    return () => setTitle(null)
  }, [course.title, setTitle])

  // Support both 'chapters' (backend) and 'parts' (old naming convention)
  const chapters = course.chapters || (course as any).parts || []

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Content without header - header is now in ChatQuickViewLayout */}
      <ScrollArea className="flex-1">
        <div className="space-y-8 pr-4">
          {/* Affichage des chapitres */}
          {chapters && chapters.length > 0 && (
            <div className="space-y-6">
              <div className="space-y-6">
                {chapters.map((chapter: any, idx: number) => (
                  <div
                    key={idx}
                    className="border border-white/20 dark:border-white/10 rounded-xl p-6 bg-muted/20 hover:bg-muted/30 transition-colors duration-200"
                  >
                    {/* Chapter Title - Centered and larger */}
                    <h2 className="text-xl font-bold text-center mb-4 text-foreground">
                      {chapter.title}
                    </h2>
                    
                    {/* Divider line */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
                    
                    {/* Content */}
                    {chapter.content && (
                      <div className="prose dark:prose-invert prose-sm max-w-none text-foreground/90">
                        <ReactMarkdown>{chapter.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message si pas de contenu */}
          {!chapters || chapters.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Aucun contenu disponible pour cette course
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

