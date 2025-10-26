'use client'

import jsPDF from 'jspdf'
import { CourseWithChapters, Chapter } from '~/models/Course'

export async function generatePdfFromCourseData(
  course: CourseWithChapters,
  filename: string
) {
  try {
    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
    })

    const margin = 20
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const contentWidth = pageWidth - margin * 2

    pdf.setFillColor(79, 70, 229) 
    pdf.rect(0, 0, pageWidth, 50, 'F')
    
    pdf.setFontSize(26)
    pdf.setFont('Helvetica', 'bold')
    pdf.setTextColor(255, 255, 255)
    
    const titleLines = pdf.splitTextToSize(course.title, contentWidth - 20)
    const titleY = titleLines.length === 1 ? 30 : 25
    pdf.text(titleLines, pageWidth / 2, titleY, { align: 'center' })

    pdf.setFontSize(10)
    pdf.setFont('Helvetica', 'normal')
    pdf.setTextColor(220, 220, 255)
    const dateStr = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    pdf.text(`Généré le ${dateStr}`, pageWidth / 2, titleY + 10, { align: 'center' })

    pdf.setDrawColor(200, 200, 220)
    pdf.setLineWidth(0.5)
    pdf.line(margin, 58, pageWidth - margin, 58)

    let yPos = 75
    let isFirstPage = true

    for (let chapterIdx = 0; chapterIdx < course.chapters.length; chapterIdx++) {
      const chapter = course.chapters[chapterIdx]
      
      if (!isFirstPage && yPos > pageHeight - margin - 30) {
        pdf.addPage()
        yPos = margin
      }

      pdf.setFillColor(245, 247, 250)
      pdf.rect(margin - 5, yPos - 8, contentWidth + 10, 14, 'F')
      
      pdf.setFontSize(16)
      pdf.setFont('Helvetica', 'bold')
      pdf.setTextColor(79, 70, 229)
      
      const chapterNumber = `Chapitre ${chapterIdx + 1} — ${chapter.title}`
      const chapterLines = pdf.splitTextToSize(chapterNumber, contentWidth - 10)
      
      pdf.text(chapterLines, margin, yPos)
      yPos += chapterLines.length * 8 + 12

      pdf.setTextColor(0, 0, 0)

      if (isMarkdown(chapter.content)) {
        yPos = applyMarkdownFormatting(pdf, chapter.content, margin, yPos, contentWidth)
      } else {
        const contentLines = pdf.splitTextToSize(chapter.content, contentWidth)
        pdf.setFontSize(11)
        pdf.setFont('Helvetica', 'normal')
        pdf.setTextColor(0, 0, 0)

        contentLines.forEach((line: string) => {
          if (yPos > pageHeight - margin - 10) {
            pdf.addPage()
            yPos = margin
          }

          pdf.text(line, margin, yPos)
          yPos += 6
        })
      }

      if (chapter.schemas && chapter.schemas.length > 0) {
        for (const schema of chapter.schemas) {
          if (schema.svgBase64) {
            yPos = await addImageToPdf(
              pdf,
              schema.svgBase64,
              margin,
              yPos,
              contentWidth,
              pageHeight,
              schema.name || chapter.schema_description
            )
          }
        }
      }

      if (chapter.img_base64) {
        yPos = await addImageToPdf(
          pdf,
          chapter.img_base64,
          margin,
          yPos,
          contentWidth,
          pageHeight,
          chapter.schema_description
        )
      }

      yPos += 15
      isFirstPage = false
    }

    pdf.setFontSize(8)
    pdf.setFont('Helvetica', 'normal')
    pdf.setTextColor(120, 120, 140)
    
    const footerText = `© ${new Date().getFullYear()} Hackathon Google — Équipe Pixia`
    pdf.text(footerText, pageWidth / 2, pageHeight - 12, { align: 'center' })
    
    pdf.setDrawColor(200, 200, 220)
    pdf.setLineWidth(0.3)
    pdf.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18)

    pdf.save(filename)

    return true
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    return false
  }
}

async function addImageToPdf(
  pdf: any,
  imgBase64: string,
  xPos: number,
  yPos: number,
  maxWidth: number,
  pageHeight: number,
  description?: string
): Promise<number> {
  const margin = 20
  let currentY = yPos

  if (currentY > pageHeight - margin - 80) {
    pdf.addPage()
    currentY = margin
  }

  currentY += 10

  try {
    let imageData = imgBase64
    if (!imgBase64.startsWith('data:')) {
      const isPng = imgBase64.startsWith('iVBOR')
      const format = isPng ? 'png' : 'jpeg'
      imageData = `data:image/${format};base64,${imgBase64}`
    }

    const img = new Image()
    
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageData
    })

    const imgAspectRatio = img.width / img.height
    let imgWidth = maxWidth - 10
    let imgHeight = imgWidth / imgAspectRatio

    const maxImgHeight = pageHeight - margin * 2 - 60
    if (imgHeight > maxImgHeight) {
      imgHeight = maxImgHeight
      imgWidth = imgHeight * imgAspectRatio
    }

    const imgX = xPos + (maxWidth - imgWidth) / 2

    if (currentY + imgHeight + 20 > pageHeight - margin) {
      pdf.addPage()
      currentY = margin
    }

    pdf.setFillColor(250, 250, 252)
    pdf.rect(imgX - 5, currentY - 5, imgWidth + 10, imgHeight + 10, 'F')
    
    pdf.setDrawColor(200, 200, 220)
    pdf.setLineWidth(0.3)
    pdf.rect(imgX - 5, currentY - 5, imgWidth + 10, imgHeight + 10)

    const format = imageData.includes('image/png') ? 'PNG' : 'JPEG'

    pdf.addImage(
      imageData,
      format,
      imgX,
      currentY,
      imgWidth,
      imgHeight,
      undefined,
      'FAST'
    )

    currentY += imgHeight + 10

    if (description) {
      currentY += 2
      
      if (currentY > pageHeight - margin - 15) {
        pdf.addPage()
        currentY = margin
      }

      pdf.setFont('Helvetica', 'italic')
      pdf.setFontSize(9)
      pdf.setTextColor(80, 80, 100)
      
      const descLines = pdf.splitTextToSize(`Figure: ${description}`, maxWidth - 10)
      
      descLines.forEach((line: string, idx: number) => {
        const lineWidth = pdf.getTextWidth(line)
        const descX = xPos + (maxWidth - lineWidth) / 2
        pdf.text(line, descX, currentY + (idx * 4))
      })
      
      currentY += descLines.length * 4 + 6
      
      pdf.setFont('Helvetica', 'normal')
      pdf.setFontSize(11)
      pdf.setTextColor(0, 0, 0)
    }

    return currentY + 5

  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'image au PDF:', error)
    
    pdf.setFont('Helvetica', 'italic')
    pdf.setFontSize(9)
    pdf.setTextColor(150, 150, 150)
    const errorMsg = '[Image non disponible]'
    const errorX = xPos + (maxWidth - pdf.getTextWidth(errorMsg)) / 2
    pdf.text(errorMsg, errorX, currentY)
    
    return currentY + 10
  }
}

function isMarkdown(text: string): boolean {
  return /^#+\s|^\*\*|^__|\n#+\s|\n\*\*|\n__|`|^\*\s|^\d+\./m.test(text)
}

function parseMarkdown(markdown: string): Array<{
  type: 'heading' | 'paragraph' | 'bold' | 'italic' | 'code' | 'list' | 'blockquote'
  level?: number
  content: string
  raw: string
}> {
  const elements: Array<any> = []
  const lines = markdown.split('\n')
  
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    
    if (line.match(/^#{1,6}\s/)) {
      const match = line.match(/^(#{1,6})\s(.+)$/)
      if (match) {
        elements.push({
          type: 'heading',
          level: match[1].length,
          content: match[2],
          raw: line,
        })
      }
      i++
      continue
    }
    
    if (line.startsWith('> ')) {
      let quote = line.slice(2)
      i++
      while (i < lines.length && lines[i].startsWith('> ')) {
        quote += '\n' + lines[i].slice(2)
        i++
      }
      elements.push({
        type: 'blockquote',
        content: quote,
        raw: quote,
      })
      continue
    }
    
    if (line.startsWith('```')) {
      let code = ''
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        code += lines[i] + '\n'
        i++
      }
      if (i < lines.length) i++ 
      elements.push({
        type: 'code',
        content: code.trim(),
        raw: code,
      })
      continue
    }
    
    if (line.match(/^\s*[-*+]\s/) || line.match(/^\s*\d+\.\s/)) {
      let list = ''
      while (i < lines.length && (lines[i].match(/^\s*[-*+]\s/) || lines[i].match(/^\s*\d+\.\s/))) {
        list += lines[i] + '\n'
        i++
      }
      elements.push({
        type: 'list',
        content: list.trim(),
        raw: list,
      })
      continue
    }
    
    if (line.trim()) {
      elements.push({
        type: 'paragraph',
        content: line,
        raw: line,
      })
    }
    
    i++
  }
  
  return elements
}

function applyMarkdownFormatting(pdf: any, text: string, xPos: number, yPos: number, maxWidth: number) {
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 15
  let currentY = yPos
  
  const elements = parseMarkdown(text)
  
  elements.forEach((elem) => {
    if (currentY > pageHeight - margin - 10) {
      pdf.addPage()
      currentY = margin
    }
    
    switch (elem.type) {
      case 'heading':
        pdf.setFont('Helvetica', 'bold')
        const fontSize = Math.max(18 - (elem.level! * 2), 12)
        pdf.setFontSize(fontSize)
        const headingLines = pdf.splitTextToSize(elem.content, maxWidth)
        pdf.text(headingLines, xPos, currentY)
        currentY += headingLines.length * 6 + 8
        break
        
      case 'paragraph':
        currentY = renderParagraphWithFormatting(pdf, elem.content, xPos, currentY, maxWidth, pageHeight, margin)
        currentY += 6
        break
        
      case 'bold':
        pdf.setFont('Helvetica', 'bold')
        pdf.setFontSize(11)
        const boldLines = pdf.splitTextToSize(elem.content, maxWidth)
        pdf.text(boldLines, xPos, currentY)
        currentY += boldLines.length * 6 + 4
        break
        
      case 'code':
        pdf.setFont('Courier', 'normal')
        pdf.setFontSize(9)
        pdf.setTextColor(50, 50, 50)
        
        const codeLines = pdf.splitTextToSize(elem.content, maxWidth - 4)
        pdf.setFillColor(240, 240, 240)
        pdf.rect(xPos - 2, currentY - 3, maxWidth + 4, codeLines.length * 5 + 4, 'F')
        pdf.setTextColor(0, 0, 0)
        pdf.text(codeLines, xPos + 2, currentY)
        currentY += codeLines.length * 5 + 8
        break
        
      case 'blockquote':
        pdf.setFont('Helvetica', 'italic')
        pdf.setFontSize(10)
        pdf.setTextColor(100, 100, 100)
        
        pdf.setDrawColor(150, 150, 150)
        pdf.line(xPos - 4, currentY - 3, xPos - 4, currentY + 15)
        
        const quoteLines = pdf.splitTextToSize(elem.content, maxWidth - 6)
        pdf.text(quoteLines, xPos + 2, currentY)
        currentY += quoteLines.length * 5 + 6
        pdf.setTextColor(0, 0, 0)
        break
        
      case 'list':
        pdf.setFont('Aptos', 'normal')
        pdf.setFontSize(11)
        const listItems = elem.content.split('\n').filter(l => l.trim())
        listItems.forEach((item) => {
          const cleanItem = item.replace(/^\s*[-*+]\s/, '• ').replace(/^\s*\d+\.\s/, '→ ')
          currentY = renderParagraphWithFormatting(pdf, cleanItem, xPos + 4, currentY, maxWidth - 8, pageHeight, margin)
        })
        currentY += 4
        break
    }
  })
  
  return currentY
}

function renderParagraphWithFormatting(pdf: any, text: string, xPos: number, yPos: number, maxWidth: number, pageHeight: number, margin: number): number {
  pdf.setFontSize(11)
  
  const lines = pdf.splitTextToSize(text, maxWidth)
  let currentY = yPos
  
  lines.forEach((line: string) => {
    if (currentY > pageHeight - margin - 10) {
      pdf.addPage()
      currentY = margin
    }
    
    const parts = parseInlineMarkdown(line)
    let currentX = xPos
    
    parts.forEach((part) => {
      const textWidth = pdf.getTextWidth(part.content)
      
      if (part.type === 'bold') {
        pdf.setFont('Helvetica', 'normal')
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(11)
        
        pdf.text(part.content, currentX, currentY)
        pdf.text(part.content, currentX + 0.3, currentY)
        
        currentX += textWidth
        
      } else if (part.type === 'italic') {
        pdf.setFont('Helvetica', 'italic')
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(11)
        
        pdf.text(part.content, currentX, currentY)
        currentX += textWidth
        
      } else if (part.type === 'code') {
        pdf.setFont('Courier', 'normal')
        pdf.setTextColor(100, 100, 100)
        pdf.setFontSize(10)
        
        pdf.setFillColor(240, 240, 240)
        pdf.rect(currentX - 0.5, currentY - 3.5, textWidth + 1, 4.5, 'F')
        
        pdf.text(part.content, currentX, currentY)
        currentX += textWidth
        
      } else {
        pdf.setFont('Helvetica', 'normal')
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(11)
        
        pdf.text(part.content, currentX, currentY)
        currentX += textWidth
      }
    })
    
    pdf.setFont('Helvetica', 'normal')
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(11)
    currentY += 5.5
  })
  
  return currentY
}

function parseInlineMarkdown(text: string): Array<{ type: 'bold' | 'italic' | 'code' | 'normal', content: string }> {
  const parts: Array<{ type: 'bold' | 'italic' | 'code' | 'normal', content: string }> = []
  
  if (!text || text.trim().length === 0) {
    return [{ type: 'normal', content: text }]
  }

  const regex = /`([^`]+)`|\*\*(.+?)\*\*|__(.+?)__|\_([^_]+)\_|\*([^*]+)\*|([^`*_]+)/g
  
  let match
  let lastIndex = 0
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex && !match[0].match(/^`|^\*|^_|^__/)) {
      const gap = text.substring(lastIndex, match.index)
      if (gap.trim()) {
        parts.push({ type: 'normal', content: gap })
      }
    }
    
    if (match[1]) {
      parts.push({ type: 'code', content: match[1] })
    } else if (match[2]) {
      parts.push({ type: 'bold', content: match[2] })
    } else if (match[3]) {
      parts.push({ type: 'bold', content: match[3] })
    } else if (match[4]) {
      parts.push({ type: 'italic', content: match[4] })
    } else if (match[5]) {
      parts.push({ type: 'italic', content: match[5] })
    } else if (match[6]) {
      if (match[6].trim()) {
        parts.push({ type: 'normal', content: match[6] })
      }
    }
    
    lastIndex = regex.lastIndex
  }
  
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex)
    if (remaining.trim()) {
      parts.push({ type: 'normal', content: remaining })
    }
  }
  
  return parts.length > 0 ? parts : [{ type: 'normal', content: text }]
}
