import { HttpError } from "./httpError"

const API_BASE: string | undefined = process.env.API_BASE

export type SendLoginResponse = {
  existing_user: boolean
  email?: string
  user_id?: string
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

export async function login(email: string, password: string) {
  if (!API_BASE) {
    throw new Error("API_BASE environment variable is not defined")
  }

  const r = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  return handle<SendLoginResponse>(r)
}
