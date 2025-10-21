"use client"

import { useEffect, useState } from "react"
import { TextGenerateEffect } from "~/components/ui/text-generate-effect"
import { ShimmeringText } from "~/components/ui/shimmering-text"

interface BotMessageDisplayProps {
  content: string
  isLatest?: boolean
  showShimmering?: boolean
  className?: string
}

/**
 * Composant réutilisable pour afficher les messages du bot avec effet shimmering
 * - Premier message: effet shimmering avec TextGenerateEffect
 * - Messages antérieurs: texte normal
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

  // 🎨 Couleurs dynamiques selon le thème
  const shimmerColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.7)"
  const baseColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)"

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

  // 📝 Texte normal pour les anciens messages
  return <span className={`text-foreground ${className}`}>{content}</span>
}
