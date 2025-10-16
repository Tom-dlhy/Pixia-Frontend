import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Binary, Brain, Code2, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

import { CourseCard } from "~/components/CourseCard"

// Liste des cours avec teintes cohérentes avec CourseCard.tint
const courses = [
  {
    id: "cours-1",
    title: "Fondamentaux IA",
    description: "Posez les bases mathématiques et algorithmiques de vos agents.",
    icon: Brain,
    badge: "8 modules",
    tint: "rose" as const,
  },
  {
    id: "cours-2",
    title: "Architecture de prompts",
    description: "Structurez des workflows complexes avec des chaînes adaptatives.",
    icon: Code2,
    badge: "Atelier",
    tint: "blue" as const,
  },
  {
    id: "cours-3",
    title: "Automation avancée",
    description: "Déployez vos modèles avec un pipeline robuste orienté production.",
    icon: Binary,
    badge: "Sprint",
    tint: "emerald" as const,
  },
  {
    id: "cours-4",
    title: "Expérience utilisateur",
    description: "Optimisez l'UX des assistants vocaux et multimodaux.",
    icon: Sparkles,
    badge: "UX Lab",
    tint: "amber" as const,
  },
] as const

// Nombre max de colonnes adaptatif
const MAX_COLUMNS = 4 as const

const gridColumnsByMax = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
} as const

export const Route = createFileRoute("/_authed/deep-courses/")({
  component: DeepCoursesIndex,
})

function DeepCoursesIndex() {
  const navigate = useNavigate()
  const gridColumnsClass = gridColumnsByMax[MAX_COLUMNS] ?? gridColumnsByMax[4]

  return (
    <div
      className={`
        grid
        ${gridColumnsClass}
        gap-x-6 gap-y-6
        place-items-stretch
        px-4 sm:px-0
      `}
    >
      {courses.map((course, index) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * 0.08,
            duration: 0.4,
            ease: "easeOut",
          }}
        >
          <CourseCard
            title={course.title}
            description={course.description}
            icon={course.icon}
            badge={course.badge}
            tint={course.tint}
            onClick={() =>
              navigate({
                to: "/deep-courses/$courseId",
                params: { courseId: course.id },
              })
            }
          />
        </motion.div>
      ))}
    </div>
  )
}
