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
  given_name: string | null
  family_name: string | null
  token?: string | null
  picture?: string | null
  locale?: string | null
  google_sub?: string | null
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

      applyAuthResult(
        {
          success: true,
          token: data.token ?? null,
          email: data.email ?? null,
          user_id: data.user_id ?? null,
          given_name: data.given_name ?? null,
          family_name: data.family_name ?? null,
          picture: data.picture ?? null,
          locale: data.locale ?? null,
          google_sub: data.google_sub ?? null,
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
