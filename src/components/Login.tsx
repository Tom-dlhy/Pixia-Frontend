import { useRouter } from "@tanstack/react-router"
import { useMutation } from "../hooks/useMutation"
import { useAppSession } from "~/utils/session"
import { Auth } from "./Auth"
import { Route as LoginRoute } from "~/routes/login"
import { applyAuthResult } from "~/utils/auth-client"
import { resolveRedirectTarget } from "~/utils/redirect"

type LoginRequest = {
  email: string
  password: string
}

type LoginResponse = {
  existing_user: boolean
  user_id: string | null
  email: string | null
  nom: string | null
  notion_token: string | null
  study: string | null
}

export function Login() {
  const router = useRouter()
  const { redirect: redirectTarget } = LoginRoute.useSearch()
  const { setSession } = useAppSession()

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

  // --- LOGIN MUTATION ---
  const loginMutation = useMutation<LoginRequest, LoginResponse>({
    fn: async (data) => {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      return (await res.json()) as LoginResponse
    },

    onSuccess: async ({ data }) => {
      if (!data.existing_user) {
        console.warn("Utilisateur inexistant :", data)
        return
      }

      console.log("Connexion réussie :", data)

      // 🔧 Workaround: Si le backend ne retourne pas user_id, utiliser l'email comme identifiant
      const userId = data.user_id || data.email || null

      applyAuthResult(
        {
          success: true,
          email: data.email ?? null,
          user_id: userId,
          nom: data.nom ?? null,
          notion_token: data.notion_token ?? null,
          study: data.study ?? null,
        },
        setSession,
      )

      const destination = resolveRedirectTarget(redirectTarget)

      if (destination?.type === "chat-detail") {
        router.navigate({ to: "/chat/$id", params: { id: destination.chatId } })
      } else {
        router.navigate({ to: "/chat" })
      }
    },

  })

  const formStatus =
    loginMutation.status === "pending"
      ? "pending"
      : loginMutation.status === "error"
      ? "error"
      : loginMutation.status === "success"
      ? "success"
      : "idle"

  const loginErrorMessage =
    loginMutation.status === "error"
      ? "Erreur de connexion. Vérifie tes identifiants ou le serveur."
      : null

  return (
    <Auth
      primaryText="Login"
      secondaryText="Sign Up"
      status={formStatus}
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        loginMutation.mutate({
          email: formData.get("email") as string,
          password: formData.get("password") as string,
        })
      }}
      onSecondaryAction={() => {
        router.navigate({
          to: "/signup",
          search: { redirect: redirectTarget ?? "/chat" },
        })
      }}
      onTestUser={() => {
        loginMutation.mutate({
          email: "test@me.com",
          password: "test",
        })
      }}
      afterSubmit={
        loginErrorMessage ? (
          <div className="text-red-400 text-center drop-shadow-sm">
            {loginErrorMessage}
          </div>
        ) : null
      }
    />
  )
}
