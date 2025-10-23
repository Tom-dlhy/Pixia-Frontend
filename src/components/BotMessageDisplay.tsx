"use client"

import { useEffect, useState, useMemo } from "react"
import ReactMarkdown from "react-markdown"
import { motion, stagger, useAnimate } from "framer-motion"
import { cn } from "~/lib/utils"

interface BotMessageDisplayProps {
  content: string
  isLatest?: boolean
  showShimmering?: boolean
  className?: string
}

/**
 * Split markdown content into logical chunks (paragraphs, code blocks, etc.)
 * Each chunk is a markdown-valid unit that can be rendered
 */
function splitMarkdownIntoChunks(content: string): string[] {
  // Split by double newlines (paragraphs) while preserving markdown structure
  const chunks = content.split(/\n\n+/)
  return chunks.filter(chunk => chunk.trim().length > 0)
}

/**
 * Composant qui combine l'effet d'écriture progressive avec le markdown
 * Chaque chunk (paragraphe, liste) apparaît progressivement et s'affiche avec le bon markdown
 */
function AnimatedMarkdown({ content, duration = 0.3 }: { content: string; duration?: number }) {
  const chunks = useMemo(() => splitMarkdownIntoChunks(content), [content])
  const [scope, animate] = useAnimate()

  useEffect(() => {
    if (scope.current) {
      animate(
        "div.markdown-chunk",
        {
          opacity: 1,
          y: 0,
        },
        {
          duration: duration,
          delay: stagger(0.1), // 0.1s entre chaque chunk
        }
      )
    }
  }, [animate, duration, chunks])

  return (
    <div ref={scope} className="space-y-0">
      {chunks.map((chunk, idx) => (
        <motion.div
          key={`chunk-${idx}`}
          className="markdown-chunk opacity-0 will-change-transform"
          style={{ y: 10 }}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                em: ({ node, ...props }) => <em className="italic" {...props} />,
                code: ({ node, ...props }) => (
                  <code className="bg-muted px-1 py-0.5 rounded text-xs" {...props} />
                ),
                pre: ({ node, ...props }) => (
                  <pre className="bg-muted p-2 rounded mb-2 overflow-x-auto" {...props} />
                ),
              }}
            >
              {chunk}
            </ReactMarkdown>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/**
 * Composant réutilisable pour afficher les messages du bot avec markdown et effet shimmering
 * - Premier message avec showShimmering=true: effet d'apparition progressive par chunk
 * - Messages antérieurs: rendu markdown statique
 */
export function BotMessageDisplay({
  content,
  isLatest = false,
  showShimmering = true,
  className = "",
}: BotMessageDisplayProps) {
  // 🎬 Si c'est le dernier message ET on veut l'effet shimmering
  if (isLatest && showShimmering) {
    return <AnimatedMarkdown content={content} duration={0.2} />
  }

  // 📝 Rendu markdown statique pour les anciens messages ou sans shimmering
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none text-foreground ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ node, ...props }) => <p className="mb-2" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          code: ({ node, ...props }) => (
            <code className="bg-muted px-1 py-0.5 rounded text-xs" {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre className="bg-muted p-2 rounded mb-2 overflow-x-auto" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
