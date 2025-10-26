'use client'

import React, { useMemo } from 'react'
import { cn } from '~/lib/utils'

interface PngDiagramRendererProps {
  imgBase64?: string
  schemaDescription?: string
  diagramType?: string
  className?: string
}

export function PngDiagramRenderer({
  imgBase64,
  schemaDescription,
  diagramType = 'diagram',
  className,
}: PngDiagramRendererProps) {
  const dataUrl = useMemo(() => {
    if (!imgBase64) {
      console.warn('[PngDiagramRenderer] No imgBase64 provided')
      return null
    }
    
    try {
      if (imgBase64.startsWith('data:')) {
        
        return imgBase64
      }
      
      const dataUrlConstructed = `data:image/png;base64,${imgBase64}`
      
      return dataUrlConstructed
    } catch (error) {
      console.error('[PngDiagramRenderer] Error processing base64:', error)
      return null
    }
  }, [imgBase64])

  if (!dataUrl) {
    console.warn('[PngDiagramRenderer] dataUrl is null, not rendering image')
    return null
  }

  

  return (
    <div
      className={cn(
        'flex justify-center items-center w-full my-6 p-4',
        'rounded-lg border border-white/10 bg-muted/10',
        className
      )}
    >
      <figure className="flex flex-col items-center gap-3">
        <img
          src={dataUrl}
          alt={schemaDescription || `Diagramme ${diagramType}`}
          title={schemaDescription}
          className={cn(
            'max-w-full h-auto',
            'rounded border border-white/10',
            'shadow-sm hover:shadow-md transition-shadow'
          )}
        />
        {schemaDescription && (
          <figcaption className="text-xs text-muted-foreground text-center italic">
            {schemaDescription}
          </figcaption>
        )}
      </figure>
    </div>
  )
}
