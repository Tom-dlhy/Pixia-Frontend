"use client"

import { memo, useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"
import { cn } from "~/lib/utils"
import { ShimmeringText } from "~/components/ui/shimmering-text"

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
  const [isDark, setIsDark] = useState<boolean>(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  )

  useEffect(() => {
    if (typeof document === "undefined") return
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  if (!content && showShimmering) {
    const shimmerColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.7)"
    const baseColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)"
    
    return (
      <ShimmeringText
        text="L'agent réfléchit..."
        duration={1.2}
        wave
        shimmeringColor={shimmerColor}
        color={baseColor}
        className="font-medium"
      />
    )
  }

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
