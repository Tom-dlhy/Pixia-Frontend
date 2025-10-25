import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { login } from "./login"
import { HttpError } from "./httpError"

// -------------------------
// 🔹 Validation des entrées
// -------------------------
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
})

// -------------------------
// 🔹 Server Function principale
// -------------------------
export const loginUser = createServerFn({ method: "POST" })
  .inputValidator(LoginSchema)
  .handler(async ({ data }) => {
    const { email, password } = data

    const isDebug = typeof window !== "undefined" && window.location.search.includes("debug-login")

    if (isDebug) {
      console.log("%c[login.server.ts] loginUser handler CALLED", "color: #8e44ad; font-weight: bold;", {
        email,
        timestamp: new Date().toISOString(),
      })
    }

    try {
      if (isDebug) {
        console.log("%c[login.server.ts] Calling login()...", "color: #8e44ad;")
      }
      const res = await login(email, password)
      if (isDebug) {
        console.log("%c[login.server.ts] login() succeeded", "color: #27ae60;", {
          existing_user: res.existing_user,
        })
      }

      return {
        success: true as const,
        error: false as const,
        status: 200,
        message: null as string | null,
        existing_user: Boolean(res.existing_user),
        user_id: res.user_id ?? null,
        email: res.email ?? email,
        nom: res.nom ?? null,
        notion_token: res.notion_token ?? null,
        study: res.study ?? null,
        userNotFound: false,
      }
    } catch (error) {
      console.error("%c[login.server.ts] login() ERROR", "color: #c0392b; font-weight: bold;", error)

      if (error instanceof HttpError) {
        return {
          success: false as const,
          error: true as const,
          status: error.status,
          message: error.body || `HTTP ${error.status}`,
          existing_user: false,
          user_id: null,
          email,
          nom: null,
          notion_token: null,
          study: null,
          userNotFound: error.status === 404,
        }
      }

      console.error("Unexpected login error", error)
      return {
        success: false as const,
        error: true as const,
        status: null,
        message: error instanceof Error ? error.message : "Unknown error",
        existing_user: false,
        user_id: null,
        email,
        nom: null,
        notion_token: null,
        study: null,
        userNotFound: false,
      }
    }
  })



