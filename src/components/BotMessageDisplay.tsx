"use client"

import ReactMarkdown from "react-markdown"
import { cn } from "~/lib/utils"

interface BotMessageDisplayProps {
  content: string
  isLatest?: boolean
  showShimmering?: boolean
  className?: string
}

/**
 * Composant simple pour afficher les messages du bot avec markdown
 * Plus de complications avec les animations progressives - on attend juste la réponse complète!
 */
export function BotMessageDisplay({
  content,
  isLatest = false,
  showShimmering = true,
  className = "",
}: BotMessageDisplayProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none text-foreground", className)}>
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
