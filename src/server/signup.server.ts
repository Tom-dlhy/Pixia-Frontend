import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { signup, type SignupPayload, type SignupResponse } from "./signup"

const SignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  name: z.string().trim().min(1, "Name is required").max(100).optional(),
})

type SignupSuccess = {
  success: true
  user_id: string
  email?: string | null
  name?: string | null
  notion_token?: string | null
  study?: string | null
}

type SignupError = {
  success: false
  error: string
}

export const signupUser = createServerFn({ method: "POST" })
  .inputValidator(SignUpSchema)
  .handler(async ({ data }): Promise<SignupSuccess | SignupError> => {
    try {
      const response = await signup(data as SignupPayload)
      
      return {
        success: true,
        user_id: response.google_sub,
        email: response.email ?? null,
        name: response.name ?? null,
        notion_token: response.notion_token ?? null,
        study: response.study ?? null,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed"
      console.error("Signup error:", error)
      
      return {
        success: false,
        error: message,
      }
    }
  })



