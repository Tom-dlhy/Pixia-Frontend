import { useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { GoogleLogin } from "@react-oauth/google"
import { useMutation } from "../hooks/useMutation"
import { useAppSession, SESSION_PROFILE_STORAGE_KEY } from "~/utils/session"
import { loginFn } from "../routes/_authed"
import { Auth } from "./Auth"
import { signupFn } from "~/routes/signup"
import { Route as LoginRoute } from "~/routes/login"

export function Login() {
  const router = useRouter()
  const { redirect: redirectTarget } = LoginRoute.useSearch()
  const { setSession } = useAppSession()
  const isClient = typeof window !== "undefined"

  type StoredProfile = {
    email?: string | null
    userId?: string | number | null
    givenName?: string | null
    familyName?: string | null
    picture?: string | null
    locale?: string | null
    googleSub?: string | null
  }

  const persistProfile = (profile: StoredProfile) => {
    if (typeof window === "undefined") return
    const hasProfile = Object.values(profile).some((value) => value !== null && value !== undefined)
    if (hasProfile) {
      window.localStorage.setItem(SESSION_PROFILE_STORAGE_KEY, JSON.stringify(profile))
    } else {
      window.localStorage.removeItem(SESSION_PROFILE_STORAGE_KEY)
    }
  }

  function buildGoogleAuthUrl(): string {
    const explicit = import.meta.env.VITE_GOOGLE_AUTH_URL
    if (explicit) return explicit

    const base = import.meta.env.VITE_BACKEND_URL
    if (!base) return "http://localhost:8000/api/auth/google"

    // If base already points to the full endpoint, return as-is
    if (/\/auth\/google\/?$/.test(base)) return base

    // Otherwise, join base with /api/auth/google safely
    const trimmed = base.replace(/\/$/, "")
    return `${trimmed}/api/auth/google`
  }

  const loginMutation = useMutation({
    fn: loginFn,
    onSuccess: async (ctx) => {
      if (!ctx.data?.error) {
        if (ctx.data?.token) {
          const profile: StoredProfile = {
            email: (ctx.data as any)?.email ?? null,
            userId: (ctx.data as any)?.user_id ?? null,
            givenName: (ctx.data as any)?.given_name ?? null,
            familyName: (ctx.data as any)?.family_name ?? null,
            picture: (ctx.data as any)?.picture ?? null,
            locale: (ctx.data as any)?.locale ?? null,
            googleSub: (ctx.data as any)?.google_sub ?? null,
          }

          window.localStorage.setItem("access_token", ctx.data.token)
          persistProfile(profile)
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("session:refresh"))
          }
          setSession((prev) => ({
            userEmail: profile.email ?? (ctx.data as any)?.email ?? prev.userEmail ?? null,
            userId: profile.userId ?? prev.userId ?? null,
            givenName: profile.givenName ?? prev.givenName ?? null,
            familyName: profile.familyName ?? prev.familyName ?? null,
            picture: profile.picture ?? prev.picture ?? null,
            locale: profile.locale ?? prev.locale ?? null,
            googleSub: profile.googleSub ?? prev.googleSub ?? null,
          }))
        }

        await router.invalidate()
        const destination = resolveRedirectTarget(redirectTarget)

        if (destination?.type === "chat-detail") {
          router.navigate({
            to: "/chat/$chatId",
            params: { chatId: destination.chatId },
          })
        } else if (destination?.type === "chat-home") {
          router.navigate({ to: "/chat" })
        } else {
          router.navigate({ to: "/chat" })
        }
        return
      }
    },
  })

  const signupMutation = useMutation({
    fn: useServerFn(signupFn),
  })

  return (
    <Auth
      actionText="Login"
      status={loginMutation.status}
      onSubmit={(e) => {
        const formData = new FormData(e.target as HTMLFormElement)

        loginMutation.mutate({
          data: {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
          },
        })
      }}
      onTestUser={() => {
        loginMutation.mutate({
          data: {
            email: "test@me.com",
            password: "test",
          },
        })
      }}
      socialSlot={isClient ? (
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              const credential = (credentialResponse as any)?.credential
              if (!credential) throw new Error("Missing Google credential")

              const url = buildGoogleAuthUrl()
              console.info("[GoogleLogin] POST", url, {
                payloadPreview: credential?.slice?.(0, 12) + "…",
              })

              const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential }),
              })

              if (!response.ok) {
                const text = await response.text().catch(() => "<no-body>")
                console.error("[GoogleLogin] Backend error", {
                  status: response.status,
                  statusText: response.statusText,
                  url,
                  body: text,
                })
                throw new Error("Erreur backend : " + response.status)
              }

              const data = await response.json()
              console.info("[GoogleLogin] Backend response", data)
              // Persist token
              if (data?.token) {
                const profile: StoredProfile = {
                  email: data.email ?? null,
                  userId: data.user_id ?? null,
                  givenName: data.given_name ?? null,
                  familyName: data.family_name ?? null,
                  picture: data.picture ?? null,
                  locale: data.locale ?? null,
                  googleSub: data.google_sub ?? null,
                }

                window.localStorage.setItem("access_token", data.token)
                persistProfile(profile)
                window.dispatchEvent(new Event("session:refresh"))
                setSession({
                  userEmail: profile.email ?? null,
                  userId: profile.userId ?? null,
                  givenName: profile.givenName ?? null,
                  familyName: profile.familyName ?? null,
                  picture: profile.picture ?? null,
                  locale: profile.locale ?? null,
                  googleSub: profile.googleSub ?? null,
                })
              }

              // Invalidate and redirect similar to standard login
              await router.invalidate()
              const destination = resolveRedirectTarget(redirectTarget)
              if (destination?.type === "chat-detail") {
                router.navigate({
                  to: "/chat/$chatId",
                  params: { chatId: destination.chatId },
                })
              } else {
                router.navigate({ to: "/chat" })
              }
            } catch (err) {
              console.error("[GoogleLogin] Erreur de connexion Google :", err)
            }
          }}
          onError={() => {
            console.warn("[GoogleLogin] Échec de la connexion Google")
          }}
        />
      ) : null}
      afterSubmit={
        loginMutation.data ? (
          <>
            <div className="text-red-400 text-center drop-shadow-sm">
              {loginMutation.data.message}
            </div>
            {loginMutation.data.userNotFound ? (
              <div className="text-center">
                <button
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  onClick={(e) => {
                    const formData = new FormData(
                      (e.target as HTMLButtonElement).form!,
                    )

                    signupMutation.mutate({
                      data: {
                        email: formData.get("email") as string,
                        password: formData.get("password") as string,
                      },
                    })
                  }}
                  type="button"
                >
                  Sign up instead?
                </button>
              </div>
            ) : null}
          </>
        ) : null
      }
    />
  )

}

type RedirectDestination =
  | { type: "chat-home" }
  | { type: "chat-detail"; chatId: string }
  | null

function resolveRedirectTarget(target?: string): RedirectDestination {
  if (!target || typeof target !== "string") return null

  if (!target.startsWith("/")) return null

  const [pathname] = target.split("?")

  if (pathname === "/chat") {
    return { type: "chat-home" }
  }

  if (pathname.startsWith("/chat/")) {
    const segments = pathname.split("/").filter(Boolean)
    const chatId = segments[1]
    if (chatId) {
      return { type: "chat-detail", chatId }
    }
  }

  return null
}
