import { useMemo } from "react"
import { useAppSession } from "~/utils/session"
import { useCourseType } from "~/context/CourseTypeContext"

export interface MessageContextOptions {
  selectedCardType?: "cours" | "exercice" | null 
  currentRoute?: "chat" | "deep-course" | "course" | "exercice" 
  deepCourseId?: string | null 
}

export function useMessageContext(options: MessageContextOptions = {}) {
  const { session } = useAppSession()
  const { courseType } = useCourseType()

  const enrichedContext = useMemo(() => {
    const parts: string[] = []

    const fullName = session.name || "Utilisateur"

    if (fullName) {
      parts.push(`[Utilisateur: ${fullName}]`)
    }

    if (session.study) {
      parts.push(`[Niveau d'étude: ${session.study}]`)
    }

    const route = options.currentRoute || "chat"
    const selectedCard = options.selectedCardType

    switch (route) {
      case "chat":
        if (selectedCard === "cours") {
          parts.push("l'utilisateur a indiqué qu'il souhaitait générer un nouveau cours")
        } else if (selectedCard === "exercice") {
          parts.push("l'utilisateur a indiqué qu'il souhaitait générer un nouvel exercice")
        }
        break

      case "deep-course":
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
  }, [session.name, session.study, courseType, options])

  const enrichMessage = (message: string): string => {
    if (!enrichedContext) return message

    return `${enrichedContext}\n\nMessage de l'utilisateur: ${message}`
  }

  return {
    enrichedContext,
    enrichMessage,
    userFullName: session.name || "Utilisateur",
  }
}
