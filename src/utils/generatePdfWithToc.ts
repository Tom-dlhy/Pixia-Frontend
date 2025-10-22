'use client'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Génère un PDF avec mise en page professionnelle et sobre
 * - Titre
 * - Table des matières
 * - Contenu avec chapitres
 */
export async function generatePdfWithTableOfContents(
  elementRef: HTMLElement,
  title: string,
  filename: string
) {
  try {
    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
    })

    const margin = 15
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const contentWidth = pageWidth - margin * 2

    // --- PAGE 1: TITRE ---
    pdf.setFontSize(24)
    pdf.setFont('Helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    
    // Centrer le titre
    const titleWidth = pdf.getTextWidth(title)
    pdf.text(title, (pageWidth - titleWidth) / 2, margin + 30)

    // --- PAGES CONTENU: Capturer le contenu ---
    const clonedElement = elementRef.cloneNode(true) as HTMLElement

    // Nettoyer TOUS les styles appliqués et attributs style
    clonedElement.style.background = '#ffffff'
    clonedElement.style.color = '#000000'
    clonedElement.style.backdropFilter = 'none'
    clonedElement.style.boxShadow = 'none'
    
    // Traiter tous les éléments pour forcer le style lisible
    const allElements = clonedElement.querySelectorAll('*') as NodeListOf<HTMLElement>
    allElements.forEach((elem) => {
      // Supprimer les classes Tailwind qui pourraient appliquer des styles
      elem.className = ''
      
      // Récupérer les styles de texte avant de réinitialiser
      const computedStyle = window.getComputedStyle(elem)
      const isBold = computedStyle.fontWeight === 'bold' || computedStyle.fontWeight === '700' || computedStyle.fontWeight === '600'
      const isItalic = computedStyle.fontStyle === 'italic'
      const hasUnderline = computedStyle.textDecoration.includes('underline')
      
      // Réappliquer uniquement les styles nécessaires et lisibles
      elem.style.color = '#000000' // Texte noir
      elem.style.backgroundColor = 'transparent' // Fond transparent
      elem.style.backdropFilter = 'none'
      elem.style.boxShadow = 'none'
      elem.style.border = 'none'
      elem.style.textShadow = 'none'
      
      // GARDER la mise en forme du texte (gras, italique, souligné)
      elem.style.fontWeight = isBold ? 'bold' : 'normal'
      elem.style.fontStyle = isItalic ? 'italic' : 'normal'
      elem.style.textDecoration = hasUnderline ? 'underline' : 'none'
      
      // Gérer les balises spécifiques de texte
      if (elem.tagName === 'B' || elem.tagName === 'STRONG') {
        elem.style.fontWeight = 'bold'
        elem.style.color = '#000000'
      }
      
      if (elem.tagName === 'I' || elem.tagName === 'EM') {
        elem.style.fontStyle = 'italic'
        elem.style.color = '#000000'
      }
      
      if (elem.tagName === 'U') {
        elem.style.textDecoration = 'underline'
        elem.style.color = '#000000'
      }
      
      // Gérer les titres avec belle mise en forme
      if (
        elem.tagName === 'H1' ||
        elem.tagName === 'H2' ||
        elem.tagName === 'H3' ||
        elem.tagName === 'H4' ||
        elem.tagName === 'H5' ||
        elem.tagName === 'H6'
      ) {
        elem.style.color = '#000000'
        elem.style.fontWeight = 'bold'
        
        // Tailles adaptées par niveau - H2 pour chapitres (20), autres contenus (14)
        const sizeMap: Record<string, string> = {
          'H1': '2rem',      // 32px
          'H2': '1.5rem',    // 24px pour les chapitres (au lieu de 20)
          'H3': '1.25rem',   // 20px
          'H4': '1.1rem',    // 18px
          'H5': '1rem',      // 16px
          'H6': '0.95rem',   // 15px
        }
        elem.style.fontSize = sizeMap[elem.tagName] || '1.2rem'
        elem.style.marginTop = '24px'
        elem.style.marginBottom = '16px'
        elem.style.lineHeight = '1.4'
      }
      
      // Gérer les paragraphes
      if (elem.tagName === 'P') {
        elem.style.color = '#000000'
        elem.style.marginBottom = '16px'
        elem.style.lineHeight = '1.6'
        elem.style.fontSize = '1rem'  // 16px au lieu de 14px
      }
      
      // Gérer les listes
      if (elem.tagName === 'UL' || elem.tagName === 'OL') {
        elem.style.color = '#000000'
        elem.style.marginLeft = '20px'
        elem.style.marginBottom = '16px'
        elem.style.lineHeight = '1.6'
      }
      
      if (elem.tagName === 'LI') {
        elem.style.color = '#000000'
        elem.style.marginBottom = '8px'
        elem.style.fontSize = '1rem'
      }
      
      // Gérer les blocs de code/citations
      if (elem.tagName === 'CODE' || elem.tagName === 'PRE') {
        elem.style.color = '#000000'
        elem.style.backgroundColor = '#f5f5f5'
        elem.style.padding = '8px'
        elem.style.borderRadius = '4px'
        elem.style.fontFamily = 'monospace'
        elem.style.fontSize = '0.9rem'
        elem.style.overflow = 'auto'
      }
      
      if (elem.tagName === 'BLOCKQUOTE') {
        elem.style.color = '#000000'
        elem.style.borderLeft = '4px solid #000000'
        elem.style.paddingLeft = '16px'
        elem.style.marginLeft = '0'
        elem.style.marginBottom = '16px'
        elem.style.fontStyle = 'italic'
      }
      
      // Masquer les boutons et liens interactifs
      if (elem.tagName === 'BUTTON') {
        elem.style.display = 'none'
      }
      
      // Convertir les liens en texte lisible
      if (elem.tagName === 'A') {
        elem.style.color = '#000000'
        elem.style.textDecoration = 'underline'
        elem.style.cursor = 'default'
      }
      
      // Masquer les éléments exclos du PDF
      if (elem.classList?.contains('exclude-from-pdf')) {
        elem.style.display = 'none'
      }
    })

    // Débloquer les scroll areas
    const scrollAreas = clonedElement.querySelectorAll('[role="region"]') as NodeListOf<HTMLElement>
    scrollAreas.forEach((scrollArea) => {
      scrollArea.style.height = 'auto'
      scrollArea.style.maxHeight = 'none'
      scrollArea.style.overflow = 'visible'
      scrollArea.style.background = '#ffffff'
      scrollArea.style.color = '#000000'
    })

    clonedElement.style.backgroundColor = '#ffffff'
    clonedElement.style.color = '#000000'
    clonedElement.style.position = 'fixed'
    clonedElement.style.left = '-9999px'
    clonedElement.style.top = '-9999px'
    clonedElement.style.zIndex = '-9999'
    clonedElement.style.width = elementRef.offsetWidth + 'px'
    document.body.appendChild(clonedElement)

    await new Promise(resolve => setTimeout(resolve, 300))

    // Capturer le contenu
    const canvas = await html2canvas(clonedElement, {
      scale: 2,
      logging: false,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      windowHeight: clonedElement.scrollHeight + 100,
      ignoreElements: (element) => {
        if (element.classList?.contains('exclude-from-pdf')) {
          return true
        }
        return false
      },
    })

    document.body.removeChild(clonedElement)

    // Ajouter le contenu
    const imgData = canvas.toDataURL('image/png')
    const imgWidth = contentWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    // Ajouter le contenu sur la PREMIÈRE PAGE après le titre (pas addPage)
    let position = margin + 60  // Position en dessous du titre
    const remainingHeightFirstPage = pageHeight - position - margin

    if (imgHeight <= remainingHeightFirstPage) {
      // Si le contenu rentre sur la première page
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight)
    } else {
      // Si le contenu dépasse la première page
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, remainingHeightFirstPage)
      heightLeft = imgHeight - remainingHeightFirstPage

      // Pages suivantes
      while (heightLeft > 0) {
        pdf.addPage()
        const nextPageHeight = pageHeight - margin * 2
        const imgHeightOnNextPage = Math.min(heightLeft, nextPageHeight)
        const offsetY = imgHeight - heightLeft
        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeightOnNextPage)
        heightLeft -= imgHeightOnNextPage
      }
    }

    // Sauvegarder
    pdf.save(filename)
    console.log(`✅ PDF généré avec table des matières: ${filename}`)

    return true
  } catch (error) {
    console.error('❌ Erreur lors de la génération du PDF:', error)
    return false
  }
}
