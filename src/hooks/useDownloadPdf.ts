"use client"

import { downloadCoursePdf } from "~/server/chatApi"

export function useDownloadPdf() {
  const downloadPdf = async (sessionId: string, filename?: string) => {
    try {
      const blob = await downloadCoursePdf(sessionId)

      if (!blob || blob.size === 0) {
        throw new Error("Le PDF généré est vide")
      }

      // Créer l'URL blob côté client
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename || `cours_${sessionId}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('[useDownloadPdf] Erreur:', error)
      throw error
    }
  }

  return { downloadPdf }
}
