import { useLocation, useNavigate } from "@tanstack/react-router"
import { useMemo } from "react"

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

  return useMemo(() => {
    if (depth <= 1) return "Vos cours"
    if (depth === 2) return formatTitle("cours", deepcourseId)
    return formatTitle("chapitre", chapterId)
  }, [depth, deepcourseId, chapterId, formatTitle])
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
