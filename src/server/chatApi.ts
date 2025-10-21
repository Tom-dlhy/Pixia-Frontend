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

export type DeepCourse = {
  deepcourse_id: string
  title: string
}

export type FetchAllDeepCoursesResponse = {
  sessions: DeepCourse[]
}

// -------------------------
// 🔹 Message de chat
// -------------------------
export type EventMessage = {
  type: "user" | "bot" | "system" | "unknown"
  text: string | null
  timestamp: string | null
}

export type FetchChatResponse = {
  session_id: string | null
  user_id: string
  messages: EventMessage[]
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

// -------------------------
// 🔹 Récupérer tous les deep-courses
// -------------------------
export async function fetchAllDeepCourses(userId: string): Promise<FetchAllDeepCoursesResponse> {
  console.log(`📡 [fetchAllDeepCourses] Appel API pour user_id: ${userId}`)
  
  const params = new URLSearchParams({ user_id: userId })
  const r = await fetch(`${API_BASE}/testfetchalldeepcourses?${params}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
  })
  
  const result = await handle<FetchAllDeepCoursesResponse>(r)
  console.log(`📡 [fetchAllDeepCourses] ${result.sessions.length} deep-courses récupérés`)
  
  return result
}

// -------------------------
// 🔹 Récupérer l'historique d'une session de chat
// -------------------------
export async function fetchChat(
  userId: string,
  sessionId: string
): Promise<FetchChatResponse> {
  console.log(`📡 [fetchChat] Appel API pour user_id: ${userId}, session_id: ${sessionId}`)
  
  // Utiliser FormData pour passer les paramètres comme le backend l'attend
  const formData = new FormData()
  formData.append("user_id", userId)
  formData.append("session_id", sessionId)
  
  const r = await fetch(`${API_BASE}/testfetchchat`, {
    method: "POST",
    body: formData,
  })
  
  const result = await handle<FetchChatResponse>(r)
  console.log(`📡 [fetchChat] ${result.messages.length} messages récupérés`)
  
  return result
}
