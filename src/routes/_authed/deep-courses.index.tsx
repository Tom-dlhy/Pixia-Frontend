import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Binary, Brain, Code2, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

import { CourseCard } from "~/components/CourseCard"

// Gradients cohérents avec la nouvelle version glassmorphique
const courseGradients = {
  rose: "bg-gradient-to-br from-rose-400/60 to-pink-500/60",
  blue: "bg-gradient-to-br from-blue-400/60 to-cyan-400/60",
  emerald: "bg-gradient-to-br from-emerald-400/60 to-teal-400/60",
  amber: "bg-gradient-to-br from-amber-300/60 to-orange-400/60",
} as const

// Liste des cours
const courses = [
  {
    id: "cours-1",
    title: "Fondamentaux IA",
    description: "Posez les bases mathématiques et algorithmiques de vos agents.",
    icon: Brain,
    badge: "8 modules",
    gradient: courseGradients.rose,
  },
  {
    id: "cours-2",
    title: "Architecture de prompts",
    description: "Structurez des workflows complexes avec des chaînes adaptatives.",
    icon: Code2,
    badge: "Atelier",
    gradient: courseGradients.blue,
  },
  {
    id: "cours-3",
    title: "Automation avancée",
    description: "Déployez vos modèles avec un pipeline robuste orienté production.",
    icon: Binary,
    badge: "Sprint",
    gradient: courseGradients.emerald,
  },
  {
    id: "cours-4",
    title: "Expérience utilisateur",
    description: "Optimisez l'UX des assistants vocaux et multimodaux.",
    icon: Sparkles,
    badge: "UX Lab",
    gradient: courseGradients.amber,
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
            gradient={course.gradient}
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
