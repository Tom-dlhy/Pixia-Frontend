import { type LucideIcon } from "lucide-react"
import { type KeyboardEvent } from "react"
import { cn } from "~/lib/utils"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

interface CourseCardProps {
  title: string
  description: string
  icon: LucideIcon
  badge?: string
  onClick?: () => void
  className?: string
  gradient?: string // permet d’ajouter un fond gradient (ex: "bg-gradient-to-br from-blue-400/60 to-cyan-400/60")
}

export function CourseCard({
  title,
  description,
  icon: Icon,
  badge,
  onClick,
  gradient,
  className,
}: CourseCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <Card
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative group flex flex-col justify-between h-[280px] w-full overflow-hidden rounded-[24px] p-6 text-left cursor-pointer transition-all duration-300",
        "bg-white/10 dark:bg-zinc-900/40 backdrop-blur-xl backdrop-saturate-150 border border-white/20 dark:border-white/10",
        "shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_8px_25px_rgba(0,0,0,0.25)]",
        "hover:scale-[1.02] hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_12px_35px_rgba(0,0,0,0.3)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2",
        "text-sidebar-foreground select-none isolate",
        className
      )}
    >
      {/* Gradient layer */}
      <div
        className={cn(
          "absolute inset-0 z-0 rounded-[inherit] opacity-70 mix-blend-overlay pointer-events-none",
          gradient
        )}
      />

      {/* Highlight reflection */}
      <div className="absolute inset-0 z-0 rounded-[inherit] bg-gradient-to-t from-white/10 to-transparent mix-blend-soft-light pointer-events-none" />

      {/* Content */}
      <CardHeader className="flex flex-col gap-6 p-0 relative z-10 flex-1">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-sidebar-foreground shadow-sm backdrop-blur-sm",
              "transition-all duration-300 group-hover:scale-105 group-hover:shadow-md"
            )}
          >
            <Icon className="h-5 w-5" />
          </span>

          {badge && (
            <span
              className={cn(
                "rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground shadow-sm backdrop-blur-sm",
                "transition-all duration-300 group-hover:shadow-md"
              )}
            >
              {badge}
            </span>
          )}
        </div>

        <div className="flex flex-col flex-1">
          <CardTitle className="text-xl font-semibold text-sidebar-foreground drop-shadow-sm">
            {title}
          </CardTitle>
          <CardDescription className="mt-2 text-sm text-sidebar-foreground/80 line-clamp-3">
            {description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardFooter className="relative z-10 mt-6 flex items-center gap-2 p-0 text-sm font-medium text-sidebar-foreground/90 transition-all duration-300 group-hover:translate-x-1">
        <span>Accéder au cours</span>
        <span aria-hidden>→</span>
      </CardFooter>
    </Card>
  )
}
