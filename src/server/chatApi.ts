const API_BASE: string | undefined = process.env.API_BASE

export type SendChatResponse = {
  session_id: string
  answer: string
  agent?: string
  redirect_id?: string
}

async function handle<T = any>(r: Response): Promise<T> {
  if (!r.ok) {
    const body = await r.text().catch(() => "")
    throw new Error(`HTTP ${r.status}: ${body}`)
  }
  return r.json() as Promise<T>
}

export async function sendChat(
  data: FormData | { user_id: string; message: string; sessionId?: string }
): Promise<SendChatResponse> {
  let options: RequestInit

  if (data instanceof FormData) {
    options = {
      method: "POST",
      body: data,
    }
  } else {
    const jsonBody = {
      user_id: data.user_id,
      message: data.message,
      session_id: data.sessionId,
    }

    options = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(jsonBody),
    }
  }

  const r = await fetch(`${API_BASE}/testchat`, options)
  return handle<SendChatResponse>(r)
}
