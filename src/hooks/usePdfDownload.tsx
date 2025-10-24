import { useMemo } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { CourseWithChapters } from '~/models/Course'
import { PdfReport } from '~/utils/generatePdfReport'

/**
 * Hook pour générer et télécharger un PDF à partir des données du cours
 */
export function usePdfDownload(course: CourseWithChapters | null, filename: string) {
  // Créer le composant PDF
  const PdfComponent = useMemo(() => {
    if (!course) return null

    return <PdfReport course={course} />
  }, [course])

  return { PdfComponent, filename }
}

export default usePdfDownload
