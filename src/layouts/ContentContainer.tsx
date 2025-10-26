"use client"

import { Outlet } from "@tanstack/react-router"
import { ReactNode } from "react"
import { cn } from "~/lib/utils"
import { ScrollArea } from "~/components/ui/scroll-area"

interface ContentContainerProps {
  children?: ReactNode
  className?: string
}

export default function ContentContainer({
  children,
  className = "",
}: ContentContainerProps) {
  return (
    <section
      data-content-container
      className={cn(
        "flex flex-1 min-h-0 max-h-full",
        "rounded-[28px] border border-white/20 dark:border-white/10",
        "bg-[rgba(255,255,255,0.15)] dark:bg-[rgba(24,24,27,0.45)]",
        "backdrop-blur-xl backdrop-saturate-150",
        "shadow-[inset_0_1px_3px_rgba(255,255,255,0.3),0_12px_40px_rgba(0,0,0,0.25)]",
        "transition-all duration-300",
        "overflow-hidden",
        className
      )}
    >
      <ScrollArea className="flex flex-1 min-h-0 max-h-full w-full">
        <div className="flex flex-1 min-h-0 max-h-full p-6 w-full">
          {children ?? <Outlet />}
        </div>
      </ScrollArea>
    </section>
  )
}
