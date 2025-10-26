import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface ExportPdfOptions {
  filename?: string
  title?: string
  margin?: number
  includeTableOfContents?: boolean
}

export function usePdfExport() {
  const exportToPdf = async (
    elementRef: HTMLElement | null,
    options: ExportPdfOptions = {}
  ) => {
    if (!elementRef) {
      console.error('[usePdfExport] Element ref is null')
      return
    }

    try {
      const {
        filename = 'export.pdf',
        title = '',
        margin = 15,
      } = options

      const clonedElement = elementRef.cloneNode(true) as HTMLElement

      clonedElement.style.background = '#ffffff'
      clonedElement.style.color = '#1a1a1a'

      const scrollAreas = clonedElement.querySelectorAll('[role="region"]') as NodeListOf<HTMLElement>
      
      scrollAreas.forEach((scrollArea) => {
        
        scrollArea.style.height = 'auto'
        scrollArea.style.maxHeight = 'none'
        scrollArea.style.overflow = 'visible'
        scrollArea.style.background = '#ffffff'
        
        const innerDiv = scrollArea.querySelector('div')
        if (innerDiv) {
          innerDiv.style.height = 'auto'
        }
      })

      const allElements = clonedElement.querySelectorAll('*') as NodeListOf<HTMLElement>
      allElements.forEach((elem) => {
        if (elem.style.background?.includes('rgba') || elem.style.backgroundColor?.includes('rgba')) {
          elem.style.backgroundColor = '#f8f8f8'
        }
        
        if (elem.style.borderColor?.includes('white') || elem.style.borderColor?.includes('rgba(255')) {
          elem.style.borderColor = '#d0d0d0'
        }
        
        elem.style.backdropFilter = 'none'
        elem.style.boxShadow = 'none'
        
        const computedStyle = window.getComputedStyle(elem)
        const color = computedStyle.color
        
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

      clonedElement.style.backgroundColor = '#ffffff'
      clonedElement.style.borderRadius = '0'

      clonedElement.style.position = 'fixed'
      clonedElement.style.left = '-9999px'
      clonedElement.style.top = '-9999px'
      clonedElement.style.zIndex = '-9999'
      clonedElement.style.width = elementRef.offsetWidth + 'px'
      document.body.appendChild(clonedElement)

      await new Promise(resolve => setTimeout(resolve, 300))

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

      const imgData = canvas.toDataURL('image/png')
      const pageWidth = 210 
      const pageHeight = 297 
      const imgWidth = pageWidth - margin * 2 
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true,
      })

      let position = margin

      if (title) {
        pdf.setFontSize(24)
        pdf.setFont('Aptos', 'bold')
        pdf.setTextColor(0, 0, 0)
        pdf.text(title, margin, margin)
        
        position = margin + 15
      }

      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight)
      heightLeft -= pageHeight - position

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.setProperties({
        title: title || 'Export',
        author: 'Equipe Pixia',
        keywords: 'course, exercise, learning',
        creator: 'Equipe Pixia',
      })

      pdf.save(filename)

      return true
    } catch (error) {
      console.error('[usePdfExport] Erreur lors de la génération du PDF:', error)
      return false
    }
  }

  return { exportToPdf }
}
