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
import { getChapters } from "~/server/chat.server"

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
  const [deepCourseTitle, setDeepCourseTitle] = useState<string>("")

  // 💾 Sauvegarder le titre du deep course au montage
  useEffect(() => {
    if (deepcourseId) {
      const title = `Cours ${deepcourseId.split("-")[1] || deepcourseId}`
      setDeepCourseTitle(title)
      localStorage.setItem(`deepcourse-title-${deepcourseId}`, title)
      console.log(`💾 [DeepCourseChaptersPage] Titre sauvegardé: ${title}`)
    }
  }, [deepcourseId])

  // 📋 Charger les chapitres depuis l'API
  useEffect(() => {
    const loadChapters = async () => {
      setIsLoading(true)
      try {
        console.log(`📡 [DeepCourseChaptersPage] Appel de getChapters pour deepcourse_id: ${deepcourseId}`)
        const fetchedChapters = await getChapters({ data: { deepcourse_id: deepcourseId } })
        console.log(`✅ [DeepCourseChaptersPage] ${fetchedChapters.length} chapitres reçus:`, fetchedChapters)
        setChapters(fetchedChapters)
      } catch (error) {
        console.error(`❌ [DeepCourseChaptersPage] Erreur lors de la récupération des chapitres:`, error)
        setChapters([])
      } finally {
        setIsLoading(false)
      }
    }

    if (deepcourseId) {
      loadChapters()
    }
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
            Cet cours approfondi ne contient pas encore de chapitres.
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

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {chapters.map((chapter, index) => (
          <motion.div
            key={chapter.chapter_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate({ to: `/deep-course/${deepcourseId}/${chapter.chapter_id}` })}
            className="cursor-pointer"
          >
            <ChapterCard
              title={chapter.title || "Sans titre"}
              description={chapter.is_complete ? "" : "⏳ En cours"}
              icon={chapter.is_complete ? Book : Zap}
              isComplete={chapter.is_complete}
              badge={`#${index + 1}`}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
