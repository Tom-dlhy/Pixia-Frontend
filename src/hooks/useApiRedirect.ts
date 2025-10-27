import { useNavigate, useLocation } from "@tanstack/react-router"

interface ApiResponse {
  agent?: string | null
  redirect_id?: string | null
  [key: string]: any
}

export function useApiRedirect() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleRedirect = (res: ApiResponse, onCloseModal?: () => void) => {
    if (res.redirect_id && res.agent) {
      let redirectTo = ""
      const agentLower = res.agent.toLowerCase()
      const currentPath = location.pathname

      if (agentLower === "deep-course-chapter" && currentPath.includes("/deep-course/")) {
        if (onCloseModal) {
          onCloseModal()
        }
        return true
      }

      if (agentLower === "course" || agentLower === "cours") {
        redirectTo = "/course/$id"
      } else if (agentLower === "exercise" || agentLower === "exercice") {
        redirectTo = "/exercise/$id"
      } else if (agentLower === "deep-course") {
        redirectTo = "/deep-course"
      } else if (agentLower === "deep-course-chapter") {
        redirectTo = "/deep-course"
      }

      if (redirectTo) {
        if (onCloseModal) {
          onCloseModal()
        }
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
