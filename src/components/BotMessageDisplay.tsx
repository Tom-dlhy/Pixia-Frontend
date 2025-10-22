"use client"

import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { TextGenerateEffect } from "~/components/ui/text-generate-effect"

interface BotMessageDisplayProps {
  content: string
  isLatest?: boolean
  showShimmering?: boolean
  className?: string
}

/**
 * Composant réutilisable pour afficher les messages du bot avec markdown et effet shimmering
 * - Premier message avec showShimmering=true: effet shimmering avec TextGenerateEffect
 * - Messages antérieurs: rendu markdown avec react-markdown
 */
export function BotMessageDisplay({
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

  // 🎬 Si c'est le dernier message ET on veut l'effet shimmering
  if (isLatest && showShimmering) {
    return (
      <TextGenerateEffect
        words={content}
        duration={0.3}
        staggerDelay={0.06}
        filter
        className={`font-normal text-foreground ${className}`}
      />
    )
  }

  // 📝 Rendu markdown pour les anciens messages ou sans shimmering
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none text-foreground ${className}`}>
      <ReactMarkdown
        components={{
          p: ({node, ...props}) => <p className="mb-2" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
          li: ({node, ...props}) => <li className="mb-1" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
          em: ({node, ...props}) => <em className="italic" {...props} />,
          code: ({node, ...props}) => <code className="bg-muted px-1 py-0.5 rounded text-xs" {...props} />,
          pre: ({node, ...props}) => <pre className="bg-muted p-2 rounded mb-2 overflow-x-auto" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
