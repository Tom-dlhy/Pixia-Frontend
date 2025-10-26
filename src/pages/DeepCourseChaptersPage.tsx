"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useNavigate } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { Book, Zap, BarChart3, Users } from "lucide-react"

import { ChapterCard } from "~/components/ChapterCard"
import { ScrollArea } from "~/components/ui/scroll-area"
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

export default function DeepCourseChaptersPage() {
  const { deepcourseId } = useParams({ from: "/_authed/deep-course/$deepcourseId" })
  const navigate = useNavigate()
  const [chapters, setChapters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [deepCourseTitle, setDeepCourseTitle] = useState<string>("")

  useEffect(() => {
    if (deepcourseId) {
      const title = `Cours ${deepcourseId.split("-")[1] || deepcourseId}`
      setDeepCourseTitle(title)
      localStorage.setItem(`deepcourse-title-${deepcourseId}`, title)
    }
  }, [deepcourseId])

  useEffect(() => {
    const loadChapters = async () => {
      setIsLoading(true)
      try {
        const fetchedChapters = await getChapters({ data: { deepcourse_id: deepcourseId } })
        
        fetchedChapters.forEach((chapter: any) => {
          const isComplete = chapter.is_complete || false
          localStorage.setItem(`chapter-complete-${chapter.chapter_id}`, String(isComplete))
        })
        
        setChapters(fetchedChapters)
      } catch (error) {
        console.error(`[DeepCourseChaptersPage] Erreur lors de la récupération des chapitres:`, error)
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
    <ScrollArea className="w-full h-full">
      <div className="flex flex-col gap-8 pr-4 pb-4">
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
          {chapters.map((chapter, index) => (
            <motion.div
              key={chapter.chapter_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                localStorage.setItem(`chapter-title-${chapter.chapter_id}`, chapter.title || "Sans titre")
                navigate({ to: `/deep-course/${deepcourseId}/${chapter.chapter_id}` })
              }}
              className="cursor-pointer h-full"
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
    </ScrollArea>
  )
}
