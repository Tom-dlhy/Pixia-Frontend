import { useNavigate } from "@tanstack/react-router"

interface ApiResponse {
  agent?: string | null
  redirect_id?: string | null
  [key: string]: any
}

/**
 * Hook pour gérer la redirection automatique basée sur la réponse API
 * Redirige vers /course/$id ou /exercise/$id si l'agent le demande
 */
export function useApiRedirect() {
  const navigate = useNavigate()

  const handleRedirect = (res: ApiResponse) => {
    // 🎯 Redirection basée sur l'agent et redirect_id
    if (res.redirect_id && res.agent) {
      let redirectTo = ""
      const agentLower = res.agent.toLowerCase()

      if (agentLower === "course" || agentLower === "cours") {
        redirectTo = "/course/$id"
      } else if (agentLower === "exercise" || agentLower === "exercice") {
        redirectTo = "/exercise/$id"
      }

      if (redirectTo) {
        setTimeout(() => {
          console.log(`🎯 Redirecting to ${redirectTo} with id: ${res.redirect_id}`)
          navigate({ to: redirectTo as any, params: { id: res.redirect_id } as any })
        }, 800)
        return true // Redirection effectuée
      }
    }
    return false // Pas de redirection
  }

  return { handleRedirect }
}
