import SectionTitle from "~/components/SectionTitle"
import { cn } from "~/lib/utils"
import { GraduationCap, BookOpen } from "lucide-react"

interface DeepCourseHeaderProps {
  title: string
  subtitle?: string
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  children?: React.ReactNode
  className?: string
  iconType?: 'graduation-cap' | 'book-open' | null
  titleGradient?: string
}

export default function DeepCourseHeader({
  title,
  subtitle,
  leftAction,
  rightAction,
  children,
  className,
  iconType,
  titleGradient,
}: DeepCourseHeaderProps) {
  const iconMap = {
    'graduation-cap': <GraduationCap className="h-8 w-8" />,
    'book-open': <BookOpen className="h-8 w-8" />,
    null: undefined,
  }

  return (
    <header className={cn("relative flex flex-col gap-8", className)}>
      <div className="relative flex items-center justify-between">
        <div className="flex-1 flex justify-start z-10">{leftAction}</div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <SectionTitle
            title={title}
            subtitle={subtitle}
            align="center"
            size="lg"
            icon={iconType ? iconMap[iconType] : undefined}
            gradient={titleGradient}
          />
        </div>

        <div className="flex-1 flex justify-end z-10">{rightAction}</div>
      </div>

      {children && <div className="flex justify-center">{children}</div>}
    </header>
  )
}
