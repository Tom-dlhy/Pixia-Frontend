import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  Award,
  BookOpen,
  Code,
  FileText,
  ListChecks,
  PenTool,
  ScrollText,
  Sparkles,
  Target,
  Zap,
} from "lucide-react"

import { ChapterCard } from "~/components/ChapterCard"

/**
 * Palette unifiée : même couleurs, gérées par le composant `ChapterCard`
 * - Chaque gradient est passé en prop
 * - L’effet glassmorphique (blur, reflets) est interne
 */
const chapterPalette = [
  {
    gradient: "bg-gradient-to-br from-blue-400/70 to-cyan-400/70 dark:from-blue-700/80 dark:to-cyan-600/80",
    icon: BookOpen,
  },
  {
    gradient: "bg-gradient-to-br from-cyan-400/70 to-green-400/70 dark:from-cyan-600/80 dark:to-emerald-600/80",
    icon: ListChecks,
  },
  {
    gradient: "bg-gradient-to-br from-green-400/70 to-teal-400/70 dark:from-emerald-600/80 dark:to-teal-600/80",
    icon: ScrollText,
  },
  {
    gradient: "bg-gradient-to-br from-teal-400/70 to-indigo-400/70 dark:from-teal-600/80 dark:to-indigo-600/80",
    icon: Sparkles,
  },
  {
    gradient: "bg-gradient-to-br from-indigo-400/70 to-purple-400/70 dark:from-indigo-600/80 dark:to-purple-600/80",
    icon: FileText,
  },
  {
    gradient: "bg-gradient-to-br from-purple-400/70 to-pink-400/70 dark:from-purple-600/80 dark:to-pink-600/80",
    icon: PenTool,
  },
  {
    gradient: "bg-gradient-to-br from-pink-400/70 to-red-400/70 dark:from-pink-600/80 dark:to-red-600/80",
    icon: Code,
  },
  {
    gradient: "bg-gradient-to-br from-red-400/70 to-amber-400/70 dark:from-red-600/80 dark:to-amber-600/80",
    icon: Zap,
  },
  {
    gradient: "bg-gradient-to-br from-amber-400/70 to-lime-400/70 dark:from-amber-500/80 dark:to-teal-600/80",
    icon: Target,
  },
  {
    gradient: "bg-gradient-to-br from-lime-400/70 to-emerald-400/70 dark:from-teal-600/80 dark:to-emerald-600/80",
    icon: Award,
  },
  {
    gradient: "bg-gradient-to-br from-emerald-400/70 to-cyan-400/70 dark:from-emerald-600/80 dark:to-cyan-600/80",
    icon: BookOpen,
  },
  {
    gradient: "bg-gradient-to-br from-cyan-400/70 to-blue-400/70 dark:from-cyan-600/80 dark:to-blue-600/80",
    icon: Sparkles,
  },
]

function DeepCourseChaptersIndex() {
  const navigate = useNavigate()
  const { courseId } = Route.useParams() as { courseId: string }

  const chapters = Array.from({ length: 12 }, (_, index) => {
    const palette = chapterPalette[index % chapterPalette.length]
    const chapterNumber = index + 1

    return {
      id: `chapitre-${chapterNumber}`,
      title: `Chapitre ${chapterNumber}`,
      description: "Approfondissez ce module clé du parcours.",
      badge: `#${chapterNumber}`,
      gradient: palette.gradient,
      icon: palette.icon,
    }
  })

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {chapters.map((chapter) => (
        <ChapterCard
          key={chapter.id}
          title={chapter.title}
          description={chapter.description}
          badge={chapter.badge}
          icon={chapter.icon}
          gradient={chapter.gradient}
          onClick={() =>
            navigate({
              to: "/deep-courses/$courseId/$chapterId",
              params: { courseId, chapterId: chapter.id },
            })
          }
          iconClassName="bg-white/25 dark:bg-zinc-800/40 border border-white/20 text-sidebar-foreground shadow-sm backdrop-blur-sm"
          badgeClassName="bg-white/25 dark:bg-zinc-800/40 border border-white/20 text-sidebar-foreground shadow-sm backdrop-blur-sm"
          titleClassName="text-sidebar-foreground"
          descriptionClassName="text-sidebar-foreground/80"
          footerClassName="text-sidebar-foreground/90"
        />
      ))}
    </div>
  )
}

export const Route = createFileRoute("/_authed/deep-courses/$courseId/")({
  component: DeepCourseChaptersIndex,
})
