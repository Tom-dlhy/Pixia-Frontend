import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface ExportPdfOptions {
  filename?: string
  title?: string
  margin?: number
  includeTableOfContents?: boolean
}

/**
 * Hook pour exporter un élément DOM en PDF avec préservation des styles
 * Utilise html2canvas pour capturer le DOM et jsPDF pour générer le PDF
 * Gère automatiquement le contenu scrollable en déroulant tout avant capture
 */
export function usePdfExport() {
  const exportToPdf = async (
    elementRef: HTMLElement | null,
    options: ExportPdfOptions = {}
  ) => {
    if (!elementRef) {
      console.error('❌ [usePdfExport] Element ref is null')
      return
    }

    try {
      const {
        filename = 'export.pdf',
        title = '',
        margin = 15,
      } = options

      console.log(`📄 [usePdfExport] Génération du PDF: ${filename}`)

      // Créer un clone de l'élément pour manipuler sans affecter le DOM original
      const clonedElement = elementRef.cloneNode(true) as HTMLElement

      // Appliquer les styles sobres pour un meilleur rendu PDF
      clonedElement.style.background = '#ffffff'
      clonedElement.style.color = '#1a1a1a'

      // Chercher tous les ScrollArea dans le clone
      const scrollAreas = clonedElement.querySelectorAll('[role="region"]') as NodeListOf<HTMLElement>
      
      scrollAreas.forEach((scrollArea) => {
        console.log(`📜 [usePdfExport] Déblocage du ScrollArea (hauteur: ${scrollArea.scrollHeight}px)`)
        
        // Désactiver le scroll et laisser le contenu s'étendre naturellement
        scrollArea.style.height = 'auto'
        scrollArea.style.maxHeight = 'none'
        scrollArea.style.overflow = 'visible'
        scrollArea.style.background = '#ffffff'
        
        // Forcer le contenu interne à prendre toute sa place
        const innerDiv = scrollArea.querySelector('div')
        if (innerDiv) {
          innerDiv.style.height = 'auto'
        }
      })

      // Nettoyer les styles glassmorphic
      const allElements = clonedElement.querySelectorAll('*') as NodeListOf<HTMLElement>
      allElements.forEach((elem) => {
        // Remplacer les couleurs transparentes/glassmorphic
        if (elem.style.background?.includes('rgba') || elem.style.backgroundColor?.includes('rgba')) {
          elem.style.backgroundColor = '#f8f8f8'
        }
        
        // Remplacer les bordures blanches par du gris
        if (elem.style.borderColor?.includes('white') || elem.style.borderColor?.includes('rgba(255')) {
          elem.style.borderColor = '#d0d0d0'
        }
        
        // Remplacer backdrop-filter et box-shadow
        elem.style.backdropFilter = 'none'
        elem.style.boxShadow = 'none'
        
        // **IMPORTANT: Forcer un texte lisible**
        const computedStyle = window.getComputedStyle(elem)
        const color = computedStyle.color
        
        // Si le texte est blanc, transparent, ou très clair -> le rendre noir
        if (
          color.includes('rgba(255') || 
          color === 'rgba(0, 0, 0, 0)' ||
          color === 'transparent' ||
          color.includes('white') ||
          (color.includes('rgb(') && !color.includes('0, 0, 0'))
        ) {
          elem.style.color = '#1a1a1a'
          elem.style.fontWeight = 'normal'
        }
      })

      // Forcer un fond blanc pour le PDF
      clonedElement.style.backgroundColor = '#ffffff'
      clonedElement.style.borderRadius = '0'

      // Ajouter temporairement le clone au DOM (hors de la vue) pour qu'html2canvas le voit
      clonedElement.style.position = 'fixed'
      clonedElement.style.left = '-9999px'
      clonedElement.style.top = '-9999px'
      clonedElement.style.zIndex = '-9999'
      clonedElement.style.width = elementRef.offsetWidth + 'px'
      document.body.appendChild(clonedElement)

      // Attendre que le DOM se mette à jour
      await new Promise(resolve => setTimeout(resolve, 300))

      // 1. Capturer le DOM en image avec html2canvas
      const canvas = await html2canvas(clonedElement, {
        scale: 2, // Haute résolution
        logging: false, // Pas de logs de html2canvas
        backgroundColor: '#ffffff', // Fond blanc pour le PDF
        useCORS: true,
        allowTaint: true,
        windowHeight: clonedElement.scrollHeight + 100, // S'assurer d'avoir la hauteur complète
        ignoreElements: (element) => {
          // Ignorer les éléments non-pertinents
          if (element.classList?.contains('exclude-from-pdf')) {
            return true
          }
          return false
        },
      })

      // Nettoyer le clone du DOM
      document.body.removeChild(clonedElement)

      // 2. Créer un document PDF
      const imgData = canvas.toDataURL('image/png')
      const pageWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgWidth = pageWidth - margin * 2 // Width with margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      // A4 dimensions en mm
      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true,
      })

      let position = margin

      // Ajouter le titre si fourni
      if (title) {
        pdf.setFontSize(24)
        pdf.setFont('Helvetica', 'bold')
        pdf.setTextColor(0, 0, 0)
        pdf.text(title, margin, margin)
        
        position = margin + 15
      }

      // 3. Ajouter l'image au PDF (pagination si nécessaire)
      // Ajouter la première image
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight)
      heightLeft -= pageHeight - position

      // Ajouter les pages suivantes si le contenu est plus long qu'une page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // 4. Ajouter les métadonnées et télécharger le PDF
      pdf.setProperties({
        title: title || 'Export',
        author: 'Hackathon Frontend',
        keywords: 'course, exercise, learning',
        creator: 'Hackathon Frontend',
      })

      pdf.save(filename)
      console.log(`✅ [usePdfExport] PDF généré avec succès: ${filename}`)

      return true
    } catch (error) {
      console.error('❌ [usePdfExport] Erreur lors de la génération du PDF:', error)
      return false
    }
  }

  return { exportToPdf }
}
