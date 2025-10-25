import { type LucideIcon } from "lucide-react"
import { type KeyboardEvent } from "react"
import { IoCheckmarkCircle } from "react-icons/io5"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { cn } from "~/lib/utils"

interface ChapterCardProps {
  title: string
  description?: string
  badge?: string
  icon?: LucideIcon
  isComplete?: boolean
  onClick?: () => void
  gradient?: string 
  className?: string
  iconClassName?: string
  badgeClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  footerClassName?: string
}

export function ChapterCard({
  title,
  description,
  badge,
  icon: Icon,
  isComplete = false,
  onClick,
  gradient,
  className,
  iconClassName,
  badgeClassName,
  titleClassName,
  descriptionClassName,
  footerClassName,
}: ChapterCardProps) {
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
        "relative group flex h-full flex-col justify-between overflow-hidden rounded-2xl border p-4 cursor-pointer text-left transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2",
        "bg-white/10 dark:bg-zinc-900/40 backdrop-blur-xl backdrop-saturate-150",
        "border-white/20 dark:border-white/10",
        "shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_8px_25px_rgba(0,0,0,0.25)]",
        "hover:scale-[1.02] hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_12px_35px_rgba(0,0,0,0.3)]",
        className
      )}
      style={{ position: "relative" }}
    >
      <div
        className={cn(
          "absolute inset-0 z-0 rounded-2xl opacity-70 mix-blend-overlay pointer-events-none",
          gradient
        )}
      />

      <div className="absolute inset-0 z-0 rounded-2xl bg-gradient-to-t from-white/10 to-transparent mix-blend-soft-light pointer-events-none" />

      <CardHeader className="flex flex-col gap-6 p-0 relative z-10">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-sidebar-foreground shadow-sm backdrop-blur-sm",
              "transition-all duration-300 group-hover:scale-105 group-hover:shadow-md",
              iconClassName
            )}
          >
            {Icon ? (
              <Icon className="h-5 w-5" />
            ) : (
              <span className="text-base font-semibold">{title[0]}</span>
            )}
          </span>

          {isComplete ? (
            <IoCheckmarkCircle className="h-6 w-6 text-green-400 drop-shadow-sm" />
          ) : badge ? (
            <span
              className={cn(
                "rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground shadow-sm backdrop-blur-sm",
                "transition-all duration-300 group-hover:shadow-md",
                badgeClassName
              )}
            >
              {badge}
            </span>
          ) : null}
        </div>

        <div>
          <CardTitle
            className={cn(
              "text-xl font-semibold text-sidebar-foreground drop-shadow-sm",
              titleClassName
            )}
          >
            {title}
          </CardTitle>
          {description && (
            <CardDescription
              className={cn(
                "mt-2 text-sm text-sidebar-foreground/80",
                descriptionClassName
              )}
            >
              {description}
            </CardDescription>
          )}
        </div>
      </CardHeader>

      <CardFooter
        className={cn(
          "relative z-10 mt-6 flex items-center gap-2 p-0 text-sm font-medium text-sidebar-foreground/90 transition-all duration-300 group-hover:translate-x-1",
          footerClassName
        )}
      >
        <span>Accéder au chapitre</span>
        <span aria-hidden>→</span>
      </CardFooter>
    </Card>
  )
}
