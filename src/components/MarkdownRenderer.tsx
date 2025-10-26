'use client'

import React from 'react'
import { cn } from '~/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const isMarkdownContent = isMarkdown(content)

  if (!isMarkdownContent) {
    return (
      <div className={cn("whitespace-pre-wrap text-sm leading-relaxed", className)}>
        {content}
      </div>
    )
  }

  const elements = parseMarkdown(content)

  return (
    <div className={cn("space-y-4", className)}>
      {elements.map((elem, idx) => (
        <MarkdownElement key={idx} element={elem} />
      ))}
    </div>
  )
}

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