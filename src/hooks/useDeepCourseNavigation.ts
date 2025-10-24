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
  const [chapterTitle, setChapterTitle] = useState<string | null>(null)

  // Récupérer et surveiller le titre du deep course
  useEffect(() => {
    if (deepcourseId) {
      // Essayer d'abord depuis localStorage (cache)
      const cached = localStorage.getItem(`deepcourse-title-${deepcourseId}`)
      if (cached) {
        console.log(`📖 [useHeaderTitle] Titre du cours trouvé en cache: ${cached}`)
        setDeepCourseTitle(cached)
      } else {
        // Si pas en cache, générer le titre par défaut
        const defaultTitle = `Cours ${deepcourseId.split("-")[1] || deepcourseId}`
        console.log(`📖 [useHeaderTitle] Titre du cours généré par défaut: ${defaultTitle}`)
        setDeepCourseTitle(defaultTitle)
      }
    }
  }, [deepcourseId])

  // Récupérer et surveiller le titre du chapitre
  useEffect(() => {
    if (chapterId) {
      const cached = localStorage.getItem(`chapter-title-${chapterId}`)
      if (cached) {
        console.log(`📖 [useHeaderTitle] Titre du chapitre trouvé en cache: ${cached}`)
        setChapterTitle(cached)
      }
    }
  }, [chapterId])

  return useMemo(() => {
    if (depth <= 1) return "Vos cours approfondis"
    if (depth === 2) {
      // Si on a le titre mis en cache, l'utiliser, sinon fallback sur l'ID
      return deepCourseTitle || formatTitle("cours", deepcourseId)
    }
    // À depth === 3, retourner le titre du chapitre
    return chapterTitle || formatTitle("chapitre", chapterId)
  }, [depth, deepcourseId, chapterId, formatTitle, deepCourseTitle, chapterTitle])
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
  const [isChapterComplete, setIsChapterComplete] = useState<boolean>(false)
  const [trigger, setTrigger] = useState(0) // Trigger pour forcer les re-renders

  // Récupérer et surveiller l'état de complétion du chapitre
  useEffect(() => {
    if (chapterId) {
      const cached = localStorage.getItem(`chapter-complete-${chapterId}`)
      if (cached !== null) {
        // Si on a une valeur en cache, l'utiliser
        const isComplete = cached === 'true'
        console.log(`✅ [useRightAction] État de complétion du chapitre trouvé en cache: ${isComplete}`)
        setIsChapterComplete(isComplete)
      } else {
        // Si pas en cache, initialiser à false
        console.log(`✅ [useRightAction] Pas d'état en cache pour ${chapterId}, initialisation à false`)
        setIsChapterComplete(false)
      }
    }
  }, [chapterId, trigger]) // Ajouter chapterId pour relire au changement de chapitre

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
        isChapterComplete: isChapterComplete,
        onMarkDone: () => {
          console.info("Chapitre marqué/repris :", chapterId)
          // Déclencher une nouvelle lecture du localStorage en changeant le trigger
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
