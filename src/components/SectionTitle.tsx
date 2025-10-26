import { cn } from "~/lib/utils"
import React, { useMemo } from "react"
import type { CSSProperties } from "react"
import { convertTailwindGradientToCss } from "~/lib/gradients"

interface SectionTitleProps {
  title: string
  subtitle?: string
  align?: "left" | "center" | "right"
  size?: "sm" | "md" | "lg"
  icon?: React.ReactNode
  className?: string
  gradient?: string
}

export default function SectionTitle({
  title,
  subtitle,
  align = "center",
  size = "lg",
  icon,
  className,
  gradient,
}: SectionTitleProps) {
  const sizes = {
    sm: "text-xl font-semibold",
    md: "text-2xl font-semibold sm:text-3xl",
    lg: "text-3xl font-semibold sm:text-4xl",
  }[size]

  const alignment = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align]

  const titleStyle = useMemo(() => {
    if (!gradient) return undefined
    
    const gradientCss = convertTailwindGradientToCss(gradient)
    
    return {
      backgroundImage: gradientCss,
      backgroundSize: "100% 100%",
      backgroundPosition: "center",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    } as CSSProperties
  }, [gradient])

  return (
    <div className={cn(alignment, className)}>
      <h1 
        className={cn(sizes, "text-zinc-900 dark:text-white flex items-center justify-center gap-3")}
        style={titleStyle}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {title}
      </h1>

      {subtitle && (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {subtitle}
        </p>
      )}
    </div>
  )
}
