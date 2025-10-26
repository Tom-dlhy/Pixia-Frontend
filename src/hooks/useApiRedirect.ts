import { useNavigate } from "@tanstack/react-router"

interface ApiResponse {
  agent?: string | null
  redirect_id?: string | null
  [key: string]: any
}

export function useApiRedirect() {
  const navigate = useNavigate()

  const handleRedirect = (res: ApiResponse) => {
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
          navigate({ to: redirectTo as any, params: { id: res.redirect_id } as any })
        }, 800)
        return true 
      }
    }
    return false
  }

  return { handleRedirect }
}
