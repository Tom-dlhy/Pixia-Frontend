"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useNavigate } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { Book, Zap, BarChart3, Users } from "lucide-react"

import { ChapterCard } from "~/components/ChapterCard"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty"
import { MessageSquare } from "lucide-react"

// Chapitres mock - à remplacer par l'API
const defaultChapters = [
  {
    id: "chapitre-1",
    title: "Introduction au cours",
    description: "Comprendre les bases",
    icon: Book,
  },
  {
    id: "chapitre-2",
    title: "Concepts avancés",
    description: "Explorez des concepts plus complexes",
    icon: Zap,
  },
  {
    id: "chapitre-3",
    title: "Applications pratiques",
    description: "Cas d'usage réels",
    icon: BarChart3,
  },
  {
    id: "chapitre-4",
    title: "Travail d'équipe",
    description: "Collaboration et intégration",
    icon: Users,
  },
]

export default function DeepCourseChaptersPage() {
  const { deepcourseId } = useParams({ from: "/_authed/deep-course/$deepcourseId" })
  const navigate = useNavigate()
  const [chapters, setChapters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 📋 Charger les chapitres (pour maintenant, utilisons les mock)
  useEffect(() => {
    setIsLoading(true)
    // Simuler un délai réseau
    setTimeout(() => {
      setChapters(defaultChapters)
      setIsLoading(false)
    }, 300)
  }, [deepcourseId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <MessageSquare className="size-8" />
          </div>
          <p className="text-muted-foreground">Chargement des chapitres...</p>
        </div>
      </div>
    )
  }

  if (chapters.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Book className="size-6" />
          </EmptyMedia>
          <EmptyTitle>Aucun chapitre disponible</EmptyTitle>
          <EmptyDescription>
            Cet deep-course ne contient pas encore de chapitres.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <p className="text-muted-foreground">
            Les chapitres apparaîtront ici une fois créés.
          </p>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Chapitres du cours</h1>
        <p className="text-muted-foreground">
          Deep-Course: <span className="text-foreground font-mono">{deepcourseId}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {chapters.map((chapter, index) => (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate({ to: `/deep-course/${deepcourseId}/${chapter.id}` })}
            className="cursor-pointer"
          >
            <ChapterCard
              title={chapter.title}
              description={chapter.description}
              icon={chapter.icon}
              badge={`#${index + 1}`}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
