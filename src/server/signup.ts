import { HttpError } from "./httpError"

const API_BASE = process.env.API_BASE

export type SignupPayload = {
  email: string
  password: string
  given_name?: string
  family_name?: string
}

export type SignupResponse = {
  user_id: string
  email: string
  given_name?: string | null
  family_name?: string | null
}

async function handle<T>(r: Response): Promise<T> {
  if (!r.ok) {
    const body = await r.text().catch(() => "")
    throw new HttpError(r.status, body)
  }
  return r.json() as Promise<T>
}

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  if (!API_BASE) {
    throw new Error("API_BASE environment variable is not defined")
  }

  const response = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  })

  return handle<SignupResponse>(response)
}
