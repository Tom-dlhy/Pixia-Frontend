import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { signup } from "./signup"
import { login } from "./login"
import { HttpError } from "./httpError"

// -------------------------
// 🔹 Validation des entrées
// -------------------------
const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  given_name: z.string().trim().min(1).max(50).optional(),
  family_name: z.string().trim().min(1).max(50).optional(),
})

// -------------------------
// 🔹 Server Function principale
// -------------------------
export const signupUser = createServerFn({ method: "POST" })
  .inputValidator(SignUpSchema)
  .handler(async ({ data }) => {
    const { email, password, given_name, family_name } = data

    try {
      const signupResponse = await signup({
        email,
        password,
        given_name,
        family_name,
      })

      let token = signupResponse.token ?? null
      let loginResponse: Awaited<ReturnType<typeof login>> | null = null

      if (!token) {
        try {
          loginResponse = await login(email, password)
          token = loginResponse.token ?? null
        } catch (loginError) {
          console.warn("Signup succeeded but login to retrieve token failed", loginError)
        }
      }

      return {
        success: true as const,
        error: false as const,
        status: 200,
        userExists: false,
        message: null as string | null,
        token,
        user_id: signupResponse.user_id ?? loginResponse?.user_id ?? null,
        email: signupResponse.email ?? loginResponse?.email ?? email,
        given_name:
          signupResponse.given_name ?? loginResponse?.given_name ?? given_name ?? null,
        family_name:
          signupResponse.family_name ?? loginResponse?.family_name ?? family_name ?? null,
        picture: signupResponse.picture ?? loginResponse?.picture ?? null,
        locale: signupResponse.locale ?? loginResponse?.locale ?? null,
        google_sub: signupResponse.google_sub ?? loginResponse?.google_sub ?? null,
      }
    } catch (error) {
      if (error instanceof HttpError) {
        return {
          success: false as const,
          error: true as const,
          status: error.status,
          userExists: error.status === 409,
          message: error.body || `HTTP ${error.status}`,
          token: null,
          user_id: null,
          email,
          given_name: null,
          family_name: null,
          picture: null,
          locale: null,
          google_sub: null,
        }
      }

      console.error("Unexpected signup error", error)
      return {
        success: false as const,
        error: true as const,
        status: null,
        userExists: false,
        message: error instanceof Error ? error.message : "Unknown error",
        token: null,
        user_id: null,
        email,
        given_name: null,
        family_name: null,
        picture: null,
        locale: null,
        google_sub: null,
      }
    }
  })



