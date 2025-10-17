import { createFileRoute, redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

// Simple loginFn: appelle le backend FastAPI pour authentifier
export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; password: string }) => d)
  .handler(async ({ data }) => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const msg = await res.text()
        return {
          error: true,
          message: msg,
          userNotFound: res.status === 404,
        }
      }

      const result = await res.json()
      if (result?.token) {
        return {
          success: true,
          token: result.token as string,
          email: (result.email as string | undefined) ?? null,
          userNotFound: false,
        }
      }

      return { error: true, message: "Invalid response from backend" }
    } catch (err) {
      console.error("Erreur de connexion :", err)
      return {
        error: true,
        message: err instanceof Error ? err.message : "Unknown error",
        userNotFound: false,
      }
    }
  })

// Route protégée
export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context, location }) => {
    const maybeUser = (context as { user?: unknown } | undefined)?.user
    const hasToken =
      typeof window !== "undefined" && Boolean(window.localStorage.getItem("access_token"))

    if (!maybeUser && !hasToken) {
      const { pathname, search, hash } = location
      const redirectPath = `${pathname ?? ""}${search ?? ""}${hash ?? ""}` || "/"
      throw redirect({
        to: "/login",
        search: (prev) => ({
          ...prev,
          redirect: redirectPath,
        }),
      })
    }
  },
})
