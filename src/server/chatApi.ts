const API_BASE: string | undefined = process.env.API_BASE

export type SendChatResponse = {
  session_id: string
  answer: string
  agent: string
  redirect_id: string
}

export type ChatSession = {
  session_id: string
  title: string
  course_type: string
}

export type FetchAllChatResponse = {
  sessions: ChatSession[]
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

// -------------------------
// 🔹 Récupérer toutes les sessions de chat
// -------------------------
export async function fetchAllChat(userId: string): Promise<FetchAllChatResponse> {
  console.log(`📡 [fetchAllChat] Appel API pour user_id: ${userId}`)
  
  const params = new URLSearchParams({ user_id: userId })
  const r = await fetch(`${API_BASE}/testfetchallchats?${params}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
  })
  
  const result = await handle<FetchAllChatResponse>(r)
  console.log(`📡 [fetchAllChat] ${result.sessions.length} sessions récupérées`)
  
  return result
}
