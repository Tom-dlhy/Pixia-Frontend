'use client'

import React, { useMemo } from 'react'
import { cn } from '~/lib/utils'

interface PngDiagramRendererProps {
  /**
   * PNG encodé en base64
   */
  imgBase64?: string
  /**
   * Description du schéma pour l'accessibilité
   */
  schemaDescription?: string
  /**
   * Type de diagramme (mermaid, plantuml, graphviz, vegalite, etc.)
   */
  diagramType?: string
  /**
   * Classes CSS additionnelles
   */
  className?: string
}

/**
 * Composant pour afficher des PNG encodés en base64
 * Supporte les images générées par Kroki ou d'autres services
 */
export function PngDiagramRenderer({
  imgBase64,
  schemaDescription,
  diagramType = 'diagram',
  className,
}: PngDiagramRendererProps) {
  // Valider et convertir le base64 en URL de données
  const dataUrl = useMemo(() => {
    if (!imgBase64) return null
    
    try {
      // Vérifier que c'est du base64 valide
      // Si c'est déjà une URL (commence par data:), l'utiliser directement
      if (imgBase64.startsWith('data:')) {
        return imgBase64
      }
      
      // Sinon, construire l'URL de données PNG
      // On suppose que c'est du PNG en base64
      return `data:image/png;base64,${imgBase64}`
    } catch (error) {
      console.error('Erreur lors du traitement du PNG base64:', error)
      return null
    }
  }, [imgBase64])

  if (!dataUrl) {
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
