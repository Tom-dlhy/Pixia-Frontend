import { useMemo } from "react"
import { useDeepCoursesLayout } from "~/layouts/DeepCourseContext"

interface DeepCourseChapterLayoutProps {
  chapterId: string
}

export function DeepCourseChapterLayout({ chapterId }: DeepCourseChapterLayoutProps) {
  const { activeTab } = useDeepCoursesLayout()

  const formattedChapterId = useMemo(() => {
    if (!chapterId) return "Chapitre"
    if (chapterId.startsWith("chapitre-")) {
      return `Chapitre ${chapterId.split("chapitre-")[1]}`
    }
    return chapterId
  }, [chapterId])

  const tabContent = useMemo(() => {
    switch (activeTab) {
      case "exercice":
        return {
          title: "Zone d'exercices",
          description:
            "Construisez vos exercices interactifs ou importez des ressources existantes.",
        }
      case "evaluation":
        return {
          title: "Évaluation",
          description:
            "Définissez vos critères, barèmes et modalités d'évaluation pour ce chapitre.",
        }
      default:
        return {
          title: "Contenu du cours",
          description:
            "Rédigez votre contenu de chapitre, ajoutez des médias et structurez vos sections.",
        }
    }
  }, [activeTab])

  return (
    <div className="flex flex-1 min-h-full flex-col">
      <div className="flex flex-1 flex-col rounded-[28px] border border-dashed border-border/50 bg-background/60 p-6 shadow-inner">
        <h3 className="text-lg font-semibold">{tabContent.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {tabContent.description}
        </p>
        <p className="mt-6 text-sm text-muted-foreground/80">
          Section active: {formattedChapterId}
        </p>
      </div>
    </div>
  )
}
