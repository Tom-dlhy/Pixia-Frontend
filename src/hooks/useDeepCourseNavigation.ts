import { useLocation, useNavigate } from "@tanstack/react-router"
import { useMemo, useState, useEffect } from "react"
import React from "react"
import { GraduationCap, BookOpen } from "lucide-react"

/**
 * Hook pour extraire et formater les IDs depuis l'URL
 * Retourne: { depth, deepcourseId, chapterId }
 */
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

    console.log(`🔍 [useDeepCourseParams] pathname="${location.pathname}"`)
    console.log(`  - segments: [${segments.join(", ")}]`)
    console.log(`  - deepCourseIndex: ${deepCourseIndex}`)
    console.log(`  - result:`, result)

    return result
  }, [location.pathname])
}

/**
 * Hook pour gérer la navigation et les actions de back
 */
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

/**
 * Hook pour calculer le titre du header basé sur le depth
 */
export function useHeaderTitle() {
  const { depth, deepcourseId, chapterId } = useDeepCourseParams()
  const { formatTitle } = useDeepCourseNavigation()
  const [deepCourseTitle, setDeepCourseTitle] = useState<string | null>(null)

  // Récupérer et surveiller le titre du deep course
  useEffect(() => {
    if (deepcourseId) {
      // Essayer d'abord depuis localStorage (cache)
      const cached = localStorage.getItem(`deepcourse-title-${deepcourseId}`)
      if (cached) {
        console.log(`📖 [useHeaderTitle] Titre trouvé en cache: ${cached}`)
        setDeepCourseTitle(cached)
      } else {
        // Si pas en cache, générer le titre par défaut
        const defaultTitle = `Cours ${deepcourseId.split("-")[1] || deepcourseId}`
        console.log(`📖 [useHeaderTitle] Titre généré par défaut: ${defaultTitle}`)
        setDeepCourseTitle(defaultTitle)
      }
    }
  }, [deepcourseId])

  return useMemo(() => {
    if (depth <= 1) return "Vos cours approfondis"
    if (depth === 2) {
      // Si on a le titre mis en cache, l'utiliser, sinon fallback sur l'ID
      return deepCourseTitle || formatTitle("cours", deepcourseId)
    }
    return formatTitle("chapitre", chapterId)
  }, [depth, deepcourseId, chapterId, formatTitle, deepCourseTitle])
}

/**
 * Hook pour obtenir le type d'icône appropriée basée sur le depth
 */
export function useHeaderIcon() {
  const { depth } = useDeepCourseParams()

  return useMemo(() => {
    if (depth <= 1) return 'graduation-cap'
    if (depth === 2) return 'book-open'
    return null
  }, [depth])
}

/**
 * Hook pour obtenir l'action button appropriée basé sur le depth
 */
export function useRightAction() {
  const { depth, deepcourseId, chapterId } = useDeepCourseParams()

  return useMemo(() => {
    // Retourner les props pour ActionButton basées sur le depth
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
        isChapterComplete: false, // TODO: récupérer depuis le backend
        onMarkDone: () => console.info("Chapitre terminé :", chapterId),
        onDeleteChapter: () => console.info("Chapitre supprimé :", chapterId),
      },
    }

    if (depth <= 1) return actionConfigs.root
    if (depth === 2 && deepcourseId) return actionConfigs.course
    if (depth === 3 && deepcourseId && chapterId) return actionConfigs.chapter
    return null
  }, [depth, deepcourseId, chapterId])
}
