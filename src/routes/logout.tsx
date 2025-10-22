import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { SESSION_PROFILE_STORAGE_KEY, useAppSession } from "~/utils/session"

function LogoutScreen() {
  const navigate = useNavigate()
  const { setSession } = useAppSession()

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("access_token")
      window.localStorage.removeItem(SESSION_PROFILE_STORAGE_KEY)
      window.dispatchEvent(new Event("session:refresh"))
    }

    setSession({
      userEmail: null,
      userId: null,
      givenName: null,
      familyName: null,
    })

    navigate({ to: "/login" })
  }, [navigate, setSession])

  return (
    <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
      Déconnexion en cours…
    </div>
  )
}

export const Route = createFileRoute("/logout")({
  component: LogoutScreen,
})
