import { HttpError } from "./httpError"

const API_BASE: string | undefined = process.env.API_BASE

export type SendSignupResponse = {
  user_id: string
  email?: string
  given_name?: string
  family_name?: string
  token?: string
  picture?: string
  locale?: string
  google_sub?: string
}

type SignupPayload = {
  email: string
  password: string
  given_name?: string
  family_name?: string
}

async function handle<T = any>(r: Response): Promise<T> {
  if (!r.ok) {
    const body = await r.text().catch(() => "")
    throw new HttpError(r.status, body)
  }
  return r.json() as Promise<T>
}

export async function signup({ email, password, given_name, family_name }: SignupPayload) {
  if (!API_BASE) {
    throw new Error("API_BASE environment variable is not defined")
  }

  const r = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, given_name, family_name }),
  })
  return handle<SendSignupResponse>(r)
}
