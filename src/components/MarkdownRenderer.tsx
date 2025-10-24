'use client'

import React from 'react'
import { cn } from '~/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

/**
 * Composant pour rendre le Markdown avec la même logique que generatePdfFromCourseData.ts
 * Reproduit l'indentation, les sauts de ligne, et la mise en forme (gras, italique, code)
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Utilise la même logique de détection que le PDF
  const isMarkdownContent = isMarkdown(content)

  if (!isMarkdownContent) {
    // Si ce n'est pas du Markdown, rend simplement le texte avec des sauts de ligne
    return (
      <div className={cn("whitespace-pre-wrap text-sm leading-relaxed", className)}>
        {content}
      </div>
    )
  }

  // Parse le Markdown comme dans le PDF
  const elements = parseMarkdown(content)

  return (
    <div className={cn("space-y-4", className)}>
      {elements.map((elem, idx) => (
        <MarkdownElement key={idx} element={elem} />
      ))}
    </div>
  )
}

/**
 * Rend un élément Markdown individuel
 */
function MarkdownElement({ element }: { element: any }) {
  switch (element.type) {
    case 'heading':
      return (
        <h1
          className={cn(
            "font-bold text-foreground mb-4 mt-6 first:mt-0 whitespace-pre-wrap",
            element.level === 1 && "text-2xl",
            element.level === 2 && "text-xl",
            element.level === 3 && "text-lg",
            element.level === 4 && "text-base",
            element.level >= 5 && "text-sm"
          )}
        >
          {element.content}
        </h1>
      )

    case 'paragraph':
      return (
        <p className="text-sm leading-relaxed text-foreground/90 mb-4">
          <InlineFormattedText text={element.content} />
        </p>
      )

    case 'blockquote':
      return (
        <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground text-sm leading-relaxed mb-4">
          <InlineFormattedText text={element.content} />
        </blockquote>
      )

    case 'code':
      return (
        <pre className="bg-muted/50 border border-muted-foreground/20 rounded-md p-4 mb-4 overflow-x-auto">
          <code className="text-xs font-mono text-foreground/90">
            {element.content}
          </code>
        </pre>
      )

    case 'image':
      return (
        <div className="flex justify-center my-6">
          <img
            src={element.src}
            alt={element.alt}
            className="max-w-full rounded-lg shadow-md border border-muted-foreground/20"
            style={{ maxWidth: '800px', width: '100%' }}
          />
        </div>
      )

    case 'list':
      const listItems = element.content.split('\n').filter((line: string) => line.trim())
      return (
        <ul className="space-y-2 mb-4">
          {listItems.map((item: string, itemIdx: number) => (
            <li key={itemIdx} className="text-sm leading-relaxed text-foreground/90 ml-4">
              <InlineFormattedText text={`• ${item.replace(/^\s*[-*+]\s/, '').replace(/^\s*\d+\.\s/, '')}`} />
            </li>
          ))}
        </ul>
      )

    default:
      return (
        <p className="text-sm leading-relaxed text-foreground/90 mb-4">
          {element.content}
        </p>
      )
  }
}

/**
 * Rend le texte avec mise en forme inline (gras, italique, code)
 * Utilise la même logique que renderParagraphWithFormatting dans le PDF
 */
function InlineFormattedText({ text }: { text: string }) {
  const parts = parseInlineMarkdown(text)

  return (
    <>
      {parts.map((part, idx) => {
        if (part.type === 'bold') {
          return (
            <strong key={idx} className="font-bold text-foreground">
              {part.content}
            </strong>
          )
        } else if (part.type === 'italic') {
          return (
            <em key={idx} className="italic text-foreground/80">
              {part.content}
            </em>
          )
        } else if (part.type === 'code') {
          return (
            <code key={idx} className="bg-muted/50 px-1 py-0.5 rounded text-xs font-mono text-foreground/90">
              {part.content}
            </code>
          )
        } else {
          return <span key={idx}>{part.content}</span>
        }
      })}
    </>
  )
}

// --- Fonctions utilitaires (mêmes que dans generatePdfFromCourseData.ts) ---

/**
 * Détecte si le contenu est du Markdown ou du HTML avec images
 */
function isMarkdown(text: string): boolean {
  return /^#+\s|^\*\*|^__|\n#+\s|\n\*\*|\n__|`|^\*\s|^\d+\.|<img/m.test(text)
}

/**
 * Parse le Markdown et retourne un tableau d'éléments structurés
 */
function parseMarkdown(markdown: string): Array<{
  type: 'heading' | 'paragraph' | 'bold' | 'italic' | 'code' | 'list' | 'blockquote' | 'image'
  level?: number
  content: string
  raw: string
  src?: string
  alt?: string
}> {
  const elements: Array<any> = []
  const lines = markdown.split('\n')

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // Heading
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

    // HTML Image tag (base64 support)
    if (line.includes('<img')) {
      // Match <img> avec src et alt dans n'importe quel ordre
      let src = ''
      let alt = ''
      
      const srcMatch = line.match(/src="([^"]+)"/i)
      const altMatch = line.match(/alt="([^"]*)"/i)
      
      if (srcMatch) src = srcMatch[1]
      if (altMatch) alt = altMatch[1]
      
      if (src) {
        elements.push({
          type: 'image',
          src: src,
          alt: alt || 'Image',
          content: alt || 'Image',
          raw: line,
        })
      }
      i++
      continue
    }

    // Blockquote
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

    // Code block
    if (line.startsWith('```')) {
      let code = ''
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        code += lines[i] + '\n'
        i++
      }
      if (i < lines.length) i++ // Skip closing ```
      elements.push({
        type: 'code',
        content: code.trim(),
        raw: code,
      })
      continue
    }

    // List items
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

    // Paragraph
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

/**
 * Parse le texte pour les éléments Markdown inline
 */
function parseInlineMarkdown(text: string): Array<{ type: 'bold' | 'italic' | 'code' | 'normal', content: string }> {
  const parts: Array<{ type: 'bold' | 'italic' | 'code' | 'normal', content: string }> = []

  if (!text || text.trim().length === 0) {
    return [{ type: 'normal', content: text }]
  }

  // Regex pour matcher les patterns Markdown
  const regex = /`([^`]+)`|\*\*(.+?)\*\*|__(.+?)__|\_([^_]+)\_|\*([^*]+)\*|([^`*_]+)/g

  let match
  let lastIndex = 0

  while ((match = regex.exec(text)) !== null) {
    // Ajouter le texte avant le match si c'est pas au début
    if (match.index > lastIndex && !match[0].match(/^`|^\*|^_|^__/)) {
      const gap = text.substring(lastIndex, match.index)
      if (gap.trim()) {
        parts.push({ type: 'normal', content: gap })
      }
    }

    if (match[1]) {
      // `code`
      parts.push({ type: 'code', content: match[1] })
    } else if (match[2]) {
      // **gras**
      parts.push({ type: 'bold', content: match[2] })
    } else if (match[3]) {
      // __gras__
      parts.push({ type: 'bold', content: match[3] })
    } else if (match[4]) {
      // _italique_
      parts.push({ type: 'italic', content: match[4] })
    } else if (match[5]) {
      // *italique*
      parts.push({ type: 'italic', content: match[5] })
    } else if (match[6]) {
      // texte normal
      if (match[6].trim()) {
        parts.push({ type: 'normal', content: match[6] })
      }
    }

    lastIndex = regex.lastIndex
  }

  // Ajouter le texte restant après le dernier match
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex)
    if (remaining.trim()) {
      parts.push({ type: 'normal', content: remaining })
    }
  }

  return parts.length > 0 ? parts : [{ type: 'normal', content: text }]
}