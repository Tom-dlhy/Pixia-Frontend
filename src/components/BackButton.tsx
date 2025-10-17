"use client"

import { Button } from "~/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { cn } from "~/lib/utils"

export default function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant="secondary"
      size="icon"
      className={cn(
        "flex items-center gap-2 rounded-md cursor-pointer transition-all duration-300",
        "border border-white/30 dark:border-white/10",
        "bg-[rgba(255,255,255,0.25)] dark:bg-[rgba(24,24,27,0.35)]",
        "backdrop-blur-md backdrop-saturate-150",
        "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.1)]",
        "hover:scale-[1.03] hover:shadow-[inset_0_1px_4px_rgba(255,255,255,0.5),0_6px_18px_rgba(0,0,0,0.15)]"
      )}
    >
      <ArrowLeft className="h-4 w-4 opacity-80" />
    </Button>
  )
}
