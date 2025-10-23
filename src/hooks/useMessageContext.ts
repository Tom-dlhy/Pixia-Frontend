import { useMemo } from "react"
import { useAppSession } from "~/utils/session"
import { useCourseType } from "~/context/CourseTypeContext"

export interface MessageContextOptions {
  // Niveau micro: contexte spécifique au type de contenu
  selectedCardType?: "cours" | "exercice" | null // Pour /chat: type de carte sélectionnée
  currentRoute?: "chat" | "deep-course" | "course" | "exercice" // Route actuelle
  deepCourseId?: string | null // Pour /deep-course: ID du deep course
}

/**
 * 🎯 Hook pour enrichir les messages avec informations macro et micro
 * 
 * Niveau MACRO:
 * - Nom Prénom de l'utilisateur
 * - Niveau d'étude (si disponible)
 * 
 * Niveau MICRO:
 * - Contexte spécifique à la route actuelle
 * - Type de contenu sélectionné
 * - Identifiants pertinents
 */
export function useMessageContext(options: MessageContextOptions = {}) {
  const { session } = useAppSession()
  const { courseType } = useCourseType()

  const enrichedContext = useMemo(() => {
    const parts: string[] = []

    // ==================== NIVEAU MACRO ====================
    const fullName = session.nom || "Utilisateur"

    if (fullName) {
      parts.push(`[Utilisateur: ${fullName}]`)
    }

    // Ajouter le niveau d'étude si disponible
    if (session.study) {
      parts.push(`[Niveau d'étude: ${session.study}]`)
    }

    // ==================== NIVEAU MICRO ====================
    const route = options.currentRoute || "chat"
    const selectedCard = options.selectedCardType

    switch (route) {
      case "chat":
        // Sur /chat: ajouter contexte basé sur la carte sélectionnée
        if (selectedCard === "cours") {
          parts.push("l'utilisateur a indiqué qu'il souhaitait générer un nouveau cours")
        } else if (selectedCard === "exercice") {
          parts.push("l'utilisateur a indiqué qu'il souhaitait générer un nouvel exercice")
        }
        // rien si aucune carte n'est choisie
        break

      case "deep-course":
        // Sur /deep-course: ajouter contexte pour deep course
        if (options.deepCourseId) {
          parts.push(
            `tu es un copilote deep course, l'utilisateur souhaite ajouter un chapitre au deep cours ${options.deepCourseId}`
          )
        } else {
          parts.push("l'utilisateur a indiqué qu'il souhaitait générer un nouveau cours approfondi")
        }
        break

      case "course":
        parts.push("tu es un copilote cours")
        break

      case "exercice":
        parts.push("tu es un copilote exercice")
        break
    }

    return parts.join("\n")
  }, [session.nom, session.study, courseType, options])

  /**
   * Enrichit un message utilisateur avec le contexte macro et micro
   * @param message Message original de l'utilisateur
   * @returns Message enrichi
   */
  const enrichMessage = (message: string): string => {
    if (!enrichedContext) return message

    // Ajouter le contexte au début du message
    return `${enrichedContext}\n\nMessage de l'utilisateur: ${message}`
  }

  return {
    enrichedContext,
    enrichMessage,
    userFullName: session.nom || "Utilisateur",
  }
}
