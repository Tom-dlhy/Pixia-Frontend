import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { signup, type SignupPayload, type SignupResponse } from "./signup"

const SignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  given_name: z.string().trim().min(1, "First name is required").max(50).optional(),
  family_name: z.string().trim().min(1, "Last name is required").max(50).optional(),
})

type SignupSuccess = {
  success: true
  user_id: string
  email: string
  given_name: string | null | undefined
  family_name: string | null | undefined
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
        user_id: response.user_id,
        email: response.email,
        given_name: response.given_name ?? null,
        family_name: response.family_name ?? null,
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



