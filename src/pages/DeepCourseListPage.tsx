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
import { extractPrimaryColor, getColorBorderStyle } from "~/lib/gradients"

const courseGradients = {
  sunset: "bg-gradient-to-br from-red-500 to-orange-500",
  nemesia: "bg-gradient-to-br from-emerald-400 to-cyan-400",
  heartsease: "bg-gradient-to-br from-fuchsia-600 to-pink-600",
  snowflakeAlt: "bg-gradient-to-br from-fuchsia-500 to-cyan-500",
  lime: "bg-gradient-to-br from-teal-400 to-yellow-200",
  gold: "bg-gradient-to-br from-amber-200 to-yellow-500",
  blueprint: "bg-gradient-to-br from-indigo-500 to-blue-500",
  rosebud: "bg-gradient-to-br from-pink-500 to-rose-500",
  northernLights: "bg-gradient-to-br from-teal-200 to-teal-500",
  candy: "bg-gradient-to-br from-fuchsia-500 to-pink-500",
  rawGreen: "bg-gradient-to-br from-lime-400 to-lime-500",
  twilight: "bg-gradient-to-br from-amber-500 to-pink-500",
  snowflake: "bg-gradient-to-br from-indigo-400 to-cyan-400",
  poppy: "bg-gradient-to-br from-rose-400 to-red-500",
  salvia: "bg-gradient-to-br from-blue-600 to-violet-600",
  amaranthus: "bg-gradient-to-br from-fuchsia-600 to-purple-600",
  clearNight: "bg-gradient-to-br from-blue-800 to-indigo-900",
  verbena: "bg-gradient-to-br from-violet-500 to-purple-500",
  sunshine: "bg-gradient-to-br from-amber-200 to-yellow-400",
  clematis: "bg-gradient-to-br from-violet-600 to-indigo-600",
  blueBird: "bg-gradient-to-br from-cyan-500 to-blue-500",
  hibiscus: "bg-gradient-to-br from-purple-500 to-purple-900",
} as const


export default function DeepCourseListPage() {
  const navigate = useNavigate()
  const { session } = useAppSession()
  
  const { deepCourses, isLoading } = useAllDeepCourses()

  const coursesWithGradients = useMemo(() => {
    const gradientKeys = Object.keys(courseGradients) as Array<keyof typeof courseGradients>
    
    return deepCourses
      .map((course, index) => {
        const id = course.deepcourse_id || `course-${index}`
        const title = course.title || `Course ${index + 1}`
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
      <div className="mt-16 flex flex-col gap-8 pr-8 pb-4 px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
          {coursesWithGradients.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                localStorage.setItem(`deepcourse-title-${course.id}`, course.title)
                localStorage.setItem(`deepcourse-gradient-${course.id}`, course.gradient)
                const primaryColor = extractPrimaryColor(course.gradient)
                const borderStyle = getColorBorderStyle(primaryColor)
                localStorage.setItem(`deepcourse-border-${course.id}`, borderStyle)
                navigate({ to: `/deep-course/${course.id}` })
              }}
              className="cursor-pointer h-full"
            >
              <CourseCard
                title={course.title}
                description={`Explorez ce cours`}
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
