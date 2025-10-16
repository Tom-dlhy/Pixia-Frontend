import { type LucideIcon } from "lucide-react"
import { type KeyboardEvent } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { cn } from "~/lib/utils"

const courseCardVariants = cva(
  [
    "group relative flex h-[280px] w-full flex-col justify-between overflow-hidden rounded-[24px] p-6 text-left",
    "border border-white/20 backdrop-blur-2xl backdrop-saturate-150",
    "shadow-[0_8px_25px_rgba(0,0,0,0.25)] transition-all duration-500 ease-out",
    "before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/10 before:to-transparent before:pointer-events-none",
    "hover:-translate-y-1 hover:brightness-110",
    "text-white isolate cursor-pointer select-none",
  ],
  {
    variants: {
      tint: {
        slate: "bg-slate-700/40 dark:bg-slate-800/40",
        blue: "bg-blue-700/40 dark:bg-blue-800/40",
        rose: "bg-rose-700/40 dark:bg-rose-800/40",
        emerald: "bg-emerald-700/40 dark:bg-emerald-800/40",
        amber: "bg-amber-600/40 dark:bg-amber-700/40",
        violet: "bg-violet-700/40 dark:bg-violet-800/40",
        gray: "bg-gray-700/40 dark:bg-gray-800/40",
      },
    },
    defaultVariants: {
      tint: "slate",
    },
  }
)

interface CourseCardProps extends VariantProps<typeof courseCardVariants> {
  title: string
  description: string
  icon: LucideIcon
  badge?: string
  onClick?: () => void
  className?: string
}

export function CourseCard({
  title,
  description,
  icon: Icon,
  badge,
  onClick,
  tint,
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
      className={cn(courseCardVariants({ tint }), className)}
    >
      <div className="relative z-10 flex flex-col flex-1 justify-between">
        <CardHeader className="flex flex-col gap-6 p-0 flex-1">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "rounded-full bg-white/20 p-3 transition-all duration-300",
                "group-hover:scale-110 group-hover:brightness-110"
              )}
            >
              <Icon className="h-5 w-5 text-white drop-shadow" />
            </span>

            {badge && (
              <span
                className={cn(
                  "rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition-all duration-300",
                  "group-hover:scale-105 group-hover:brightness-110"
                )}
              >
                {badge}
              </span>
            )}
          </div>

          <div className="flex flex-col flex-1">
            <CardTitle className="text-xl font-semibold text-white drop-shadow">
              {title}
            </CardTitle>
            <CardDescription className="mt-2 text-sm text-white/80 line-clamp-3">
              {description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardFooter
          className={cn(
            "mt-6 flex items-center gap-2 p-0 text-sm font-medium text-white/90",
            "group-hover:translate-x-1 transition-transform duration-200"
          )}
        >
          <span>Accéder au cours</span>
          <span aria-hidden>→</span>
        </CardFooter>
      </div>
    </Card>
  )
}
