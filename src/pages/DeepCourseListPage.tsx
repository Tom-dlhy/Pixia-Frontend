"use client"

import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { Brain, Code2, Binary, Sparkles } from "lucide-react"

import { useAppSession } from "~/utils/session"
import { getAllDeepCourses } from "~/server/chat.server"
import { CourseCard } from "~/components/CourseCard"
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
  const [deepCourses, setDeepCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const userId = session.userId != null ? String(session.userId) : "anonymous-user"

  // 📋 Charger les deep-courses au montage
  useEffect(() => {
    const loadDeepCourses = async () => {
      if (!userId || userId === "anonymous-user") {
        console.log("⚠️ [DeepCourseListPage] Utilisateur non authentifié, skip")
        return
      }

      setIsLoading(true)
      try {
        console.log(`🔄 [DeepCourseListPage] Appel API pour user_id: ${userId}`)
        const res = await getAllDeepCourses({
          data: {
            user_id: userId,
          },
        })
        console.log(`✅ [DeepCourseListPage] Réponse:`, res)
        console.log(`✅ [DeepCourseListPage] Premier élément:`, res?.[0])
        setDeepCourses(res || [])
        console.log(`✅ [DeepCourseListPage] ${res?.length || 0} deep-courses récupérés`)
      } catch (err) {
        console.error("❌ [DeepCourseListPage] Erreur lors du chargement:", err)
        // Fallback to default courses
        setDeepCourses(defaultCourses)
      } finally {
        setIsLoading(false)
      }
    }

    loadDeepCourses()
  }, [userId])

  // Mapper les deep-courses avec des gradients
  const coursesWithGradients = useMemo(() => {
    const gradientKeys = Object.keys(courseGradients) as Array<keyof typeof courseGradients>
    
    console.log(`📊 [useMemo] deepCourses avant mapping:`, deepCourses)
    
    return deepCourses
      .map((course, index) => {
        // Accepter la structure du backend: deepcourse_id, title, completion
        const id = course.id || course.deepcourse_id || `course-${index}`
        const title = course.title || course.name || `Course ${index + 1}`
        const completion = typeof course.completion === 'number' ? course.completion : 0
        
        return {
          id: String(id),
          title: String(title),
          completion: Math.min(Math.max(completion, 0), 100), // Clamp 0-100
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
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Vos Deep-Courses</h1>
        <p className="text-muted-foreground">
          Explorez et gérez vos cours approfondis
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {coursesWithGradients.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate({ to: `/deep-course/${course.id}` })}
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
  )
}
