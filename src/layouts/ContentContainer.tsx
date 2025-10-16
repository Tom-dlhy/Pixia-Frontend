"use client"

import { Outlet } from "@tanstack/react-router"
import { ReactNode } from "react"
import { cn } from "~/lib/utils"

interface ContentContainerProps {
  children?: ReactNode
  className?: string
}

/**
 * Generic container for main page content.
 * Styled with a glassmorphism effect for visual consistency with CopiloteContainer.
 */
export default function ContentContainer({
  children,
  className = "",
}: ContentContainerProps) {
  return (
    <section
      className={cn(
        "flex flex-1 min-h-full p-6",
        "rounded-[28px] border border-white/20 dark:border-white/10",
        "bg-[rgba(255,255,255,0.15)] dark:bg-[rgba(24,24,27,0.45)]",
        "backdrop-blur-xl backdrop-saturate-150",
        "shadow-[inset_0_1px_3px_rgba(255,255,255,0.3),0_12px_40px_rgba(0,0,0,0.25)]",
        "transition-all duration-300",
        className
      )}
    >
      <div className="flex flex-1 min-h-full">
        {children ?? <Outlet />}
      </div>
    </section>
  )
}
