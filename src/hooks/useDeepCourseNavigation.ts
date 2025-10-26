import { useLocation, useNavigate } from "@tanstack/react-router"
import { useMemo, useState, useEffect } from "react"
import React from "react"
import { GraduationCap, BookOpen } from "lucide-react"

export function useDeepCourseParams() {
  const location = useLocation()

  return useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean)
    const deepCourseIndex = segments.indexOf("deep-course")
    const depth = deepCourseIndex === -1 ? 0 : segments.length - deepCourseIndex

    const result = {
      depth,
      deepcourseId: depth >= 2 ? segments[deepCourseIndex + 1] : undefined,
      chapterId: depth >= 3 ? segments[deepCourseIndex + 2] : undefined,
    }

    return result
  }, [location.pathname])
}

export function useDeepCourseNavigation() {
  const navigate = useNavigate()
  const { depth, deepcourseId } = useDeepCourseParams()

  return useMemo(
    () => ({
      handleNavigateBack: () => {
        if (depth <= 1) navigate({ to: "/chat" })
        else if (depth === 2) navigate({ to: "/deep-course" })
        else if (depth === 3 && deepcourseId)
          navigate({ to: `/deep-course/${deepcourseId}` })
      },
      formatTitle: (prefix: string, id?: string) =>
        id?.startsWith(prefix)
          ? `${prefix[0].toUpperCase()}${prefix.slice(1)} ${id.split(`${prefix}-`)[1]}`
          : id ?? prefix,
    }),
    [depth, deepcourseId, navigate]
  )
}

export function useHeaderTitle() {
  const { depth, deepcourseId, chapterId } = useDeepCourseParams()
  const { formatTitle } = useDeepCourseNavigation()
  const [deepCourseTitle, setDeepCourseTitle] = useState<string | null>(null)
  const [chapterTitle, setChapterTitle] = useState<string | null>(null)

  useEffect(() => {
    if (deepcourseId) {
      const cached = localStorage.getItem(`deepcourse-title-${deepcourseId}`)
      if (cached) {
        
        setDeepCourseTitle(cached)
      } else {
        const defaultTitle = `Cours ${deepcourseId.split("-")[1] || deepcourseId}`
        
        setDeepCourseTitle(defaultTitle)
      }
    }
  }, [deepcourseId])

  useEffect(() => {
    if (chapterId) {
      const cached = localStorage.getItem(`chapter-title-${chapterId}`)
      if (cached) {
        
        setChapterTitle(cached)
      }
    }
  }, [chapterId])

  return useMemo(() => {
    if (depth <= 1) return "Vos cours approfondis"
    if (depth === 2) {
      return deepCourseTitle || formatTitle("cours", deepcourseId)
    }
    return chapterTitle || formatTitle("chapitre", chapterId)
  }, [depth, deepcourseId, chapterId, formatTitle, deepCourseTitle, chapterTitle])
}

export function useHeaderIcon() {
  const { depth } = useDeepCourseParams()

  return useMemo(() => {
    if (depth <= 1) return 'graduation-cap'
    if (depth === 2) return 'book-open'
    return null
  }, [depth])
}

export function useRightAction() {
  const { depth, deepcourseId, chapterId } = useDeepCourseParams()
  const [isChapterComplete, setIsChapterComplete] = useState<boolean>(false)
  const [trigger, setTrigger] = useState(0) 

  useEffect(() => {
    if (chapterId) {
      const cached = localStorage.getItem(`chapter-complete-${chapterId}`)
      if (cached !== null) {
        const isComplete = cached === 'true'
        setIsChapterComplete(isComplete)
      } else {
        setIsChapterComplete(false)
      }
    }
  }, [chapterId, trigger]) 

  return useMemo(() => {
    const actionConfigs: Record<string, { viewLevel: "root" | "course" | "chapter"; [key: string]: any }> = {
      root: { viewLevel: "root" as const, onCreateCourse: () => console.info("Création d'un nouveau cours") },
      course: {
        viewLevel: "course" as const,
        onAddChapter: () => console.info("Ajout d'un chapitre :", deepcourseId),
        onDeleteCourse: () => console.info("Suppression du cours :", deepcourseId),
      },
      chapter: {
        viewLevel: "chapter" as const,
        chapterId: chapterId,
        isChapterComplete: isChapterComplete,
        onMarkDone: () => {
          console.info("Chapitre marqué/repris :", chapterId)
          setTrigger((prev) => prev + 1)
        },
        onDeleteChapter: () => console.info("Chapitre supprimé :", chapterId),
      },
    }

    if (depth <= 1) return actionConfigs.root
    if (depth === 2 && deepcourseId) return actionConfigs.course
    if (depth === 3 && deepcourseId && chapterId) return actionConfigs.chapter
    return null
  }, [depth, deepcourseId, chapterId, isChapterComplete, trigger])
}
