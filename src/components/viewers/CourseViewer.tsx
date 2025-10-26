'use client'

import { useEffect } from 'react'
import { CourseOutput } from '~/models/Document'
import { ScrollArea } from '~/components/ui/scroll-area'
import { MarkdownRenderer } from '~/components/MarkdownRenderer'
import { PngDiagramRenderer } from '~/components/PngDiagramRenderer'
import { useDocumentTitle } from '~/context/DocumentTitleContext'

interface CourseViewerProps {
  course: CourseOutput
}

export function CourseViewer({ course }: CourseViewerProps) {
  const { setTitle } = useDocumentTitle()
  
  useEffect(() => {
    setTitle(course.title || null)
    return () => setTitle(null)
  }, [course.title, setTitle])

  const chapters = course.chapters || (course as any).parts || []

  useEffect(() => {
    
    chapters.forEach((chapter: any, idx: number) => {
      if (chapter.img_base64) {
        
      } else {
        
      }
    })
  }, [chapters])

  return (
    <div className="flex flex-col gap-6 h-full">
      <ScrollArea className="flex-1">
        <div className="space-y-8 pr-4 w-full">
          {chapters && chapters.length > 0 && (
            <div className="space-y-6">
              <div className="space-y-6">
                {chapters.map((chapter: any, idx: number) => (
                  <div
                    key={idx}
                    className="border border-white/20 dark:border-white/10 rounded-xl p-6 bg-muted/20 hover:bg-muted/30 transition-colors duration-200"
                  >
                    <h2 className="text-xl font-bold text-center mb-4 text-foreground">
                      {chapter.title}
                    </h2>
                    
                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
                    
                    {chapter.content && (
                      <MarkdownRenderer content={chapter.content} />
                    )}

                    {chapter.img_base64 && (
                      <div className="mt-8 pt-6 border-t border-white/10">
                        <PngDiagramRenderer
                          imgBase64={chapter.img_base64}
                          schemaDescription={chapter.schema_description}
                          diagramType={chapter.diagram_type}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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

