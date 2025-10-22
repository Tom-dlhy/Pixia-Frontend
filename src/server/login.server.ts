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

    try {
      const res = await login(email, password)

      return {
        success: true as const,
        error: false as const,
        status: 200,
        message: null as string | null,
        existing_user: Boolean(res.existing_user),
        user_id: res.user_id ?? null,
        email: res.email ?? email,
        given_name: res.given_name ?? null,
        family_name: res.family_name ?? null,
        userNotFound: false,
      }
    } catch (error) {
      if (error instanceof HttpError) {
        return {
          success: false as const,
          error: true as const,
          status: error.status,
          message: error.body || `HTTP ${error.status}`,
          existing_user: false,
          user_id: null,
          email,
          given_name: null,
          family_name: null,
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
        given_name: null,
        family_name: null,
        userNotFound: false,
      }
    }
  })



