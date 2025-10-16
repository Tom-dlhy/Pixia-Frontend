import SectionTitle from "~/components/SectionTitle"
import { cn } from "~/lib/utils"

interface DeepCourseHeaderProps {
  title: string
  subtitle?: string
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export default function DeepCourseHeader({
  title,
  subtitle,
  leftAction,
  rightAction,
  children,
  className,
}: DeepCourseHeaderProps) {
  return (
    <header className={cn("relative flex flex-col gap-8", className)}>
      {/* Ligne principale : boutons + titre centré */}
      <div className="relative flex items-center justify-between">
        {/* Bouton gauche */}
        <div className="flex-1 flex justify-start z-10">{leftAction}</div>

        {/* Titre centré */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <SectionTitle
            title={title}
            subtitle={subtitle}
            align="center"
            size="lg"
          />
        </div>

        {/* Bouton droit */}
        <div className="flex-1 flex justify-end z-10">{rightAction}</div>
      </div>

      {/* Onglets (Cours / Exercice / Évaluation) */}
      {children && <div className="flex justify-center">{children}</div>}
    </header>
  )
}
