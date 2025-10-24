"use client"

import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { Brain, Code2, Binary, Sparkles } from "lucide-react"

import { useAppSession } from "~/utils/session"
import { useAllDeepCourses } from "~/hooks/useListCache"
import { CourseCard } from "~/components/CourseCard"
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

// Gradients cohérents
const courseGradients = {
  rose: "bg-gradient-to-br from-rose-400/60 to-pink-500/60",
  blue: "bg-gradient-to-br from-blue-400/60 to-cyan-400/60",
  emerald: "bg-gradient-to-br from-emerald-400/60 to-teal-400/60",
  amber: "bg-gradient-to-br from-amber-300/60 to-orange-400/60",
} as const

const defaultCourses = [
  {
    id: "deepcourse-123",
    title: "Deep Course 1 Title",
  },
  {
    id: "deepcourse-456",
    title: "Deep Course 2 Title",
  },
]

export default function DeepCourseListPage() {
  const navigate = useNavigate()
  const { session } = useAppSession()
  
  // � Utiliser le hook de cache React Query
  const { deepCourses, isLoading } = useAllDeepCourses()

  // Mapper les deep-courses avec des gradients
  const coursesWithGradients = useMemo(() => {
    const gradientKeys = Object.keys(courseGradients) as Array<keyof typeof courseGradients>
    
    console.log(`📊 [useMemo] deepCourses avant mapping:`, deepCourses)
    
    return deepCourses
      .map((course, index) => {
        // Utiliser la structure du backend: deepcourse_id, title, completion
        const id = course.deepcourse_id || `course-${index}`
        const title = course.title || `Course ${index + 1}`
        // Backend envoie completion normalisé (0-1), conversion en pourcentage (0-100)
        const completionNormalized = typeof course.completion === 'number' ? course.completion : 0
        const completion = Math.round(completionNormalized * 100)
        
        return {
          id: String(id),
          title: String(title),
          completion: completion,
          gradient: courseGradients[gradientKeys[index % gradientKeys.length]],
          icon: [Brain, Code2, Binary, Sparkles][index % 4],
        }
      })
  }, [deepCourses])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <MessageSquare className="size-8" />
          </div>
          <p className="text-muted-foreground">Chargement des cours...</p>
        </div>
      </div>
    )
  }

  if (coursesWithGradients.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageSquare className="size-6" />
          </EmptyMedia>
          <EmptyTitle>Aucun deep-course disponible</EmptyTitle>
          <EmptyDescription>
            Il n'y a pas encore de deep-courses créés.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <p className="text-muted-foreground">
            Les deep-courses apparaîtront ici une fois créés.
          </p>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <ScrollArea className="w-full h-full">
      <div className="mt-16 flex flex-col gap-8 pr-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coursesWithGradients.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                // 💾 Sauvegarder le titre avant de naviguer
                localStorage.setItem(`deepcourse-title-${course.id}`, course.title)
                console.log(`💾 [DeepCourseListPage] Titre sauvegardé: ${course.title}`)
                navigate({ to: `/deep-course/${course.id}` })
              }}
              className="cursor-pointer"
            >
              <CourseCard
                title={course.title}
                description={`${course.title} - Explorez ce cours`}
                icon={course.icon}
                gradient={course.gradient}
                completion={course.completion}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
