"use client"

import { memo } from "react"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"
import { cn } from "~/lib/utils"

interface BotMessageDisplayProps {
  content: string
  isLatest?: boolean
  showShimmering?: boolean
  className?: string
}

const BOT_MARKDOWN_COMPONENTS = {
  p: ({ node, ...props }: any) => <p className="mb-2" {...props} />,
  ul: ({ node, ...props }: any) => <ul className="list-disc list-inside mb-2" {...props} />,
  ol: ({ node, ...props }: any) => <ol className="list-decimal list-inside mb-2" {...props} />,
  li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
  strong: ({ node, ...props }: any) => <strong className="font-semibold" {...props} />,
  em: ({ node, ...props }: any) => <em className="italic" {...props} />,
  code: ({ node, ...props }: any) => (
    <code className="bg-muted px-1 py-0.5 rounded text-xs" {...props} />
  ),
  pre: ({ node, ...props }: any) => (
    <pre className="bg-muted p-2 rounded mb-2 overflow-x-auto" {...props} />
  ),
}

const BOT_REMARK_PLUGINS = [remarkMath]
const BOT_REHYPE_PLUGINS = [rehypeKatex]

export const BotMessageDisplay = memo(function BotMessageDisplay({
  content,
  isLatest = false,
  showShimmering = true,
  className = "",
}: BotMessageDisplayProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none text-foreground", className)}>
      <ReactMarkdown
        remarkPlugins={BOT_REMARK_PLUGINS}
        rehypePlugins={BOT_REHYPE_PLUGINS}
        components={BOT_MARKDOWN_COMPONENTS}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
})
