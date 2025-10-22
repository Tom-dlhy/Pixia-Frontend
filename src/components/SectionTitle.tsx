import { cn } from "~/lib/utils"
import React from "react"

interface SectionTitleProps {
  title: string
  subtitle?: string
  align?: "left" | "center" | "right"
  size?: "sm" | "md" | "lg"
  icon?: React.ReactNode
  className?: string
}

export default function SectionTitle({
  title,
  subtitle,
  align = "center",
  size = "lg",
  icon,
  className,
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

  return (
    <div className={cn(alignment, className)}>
      {/* Titre principal — blanc en dark, noir en light */}
      <h1 className={cn(sizes, "text-zinc-900 dark:text-white flex items-center justify-center gap-3")}>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {title}
      </h1>

      {/* Sous-titre — gris doux selon le thème */}
      {subtitle && (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {subtitle}
        </p>
      )}
    </div>
  )
}
