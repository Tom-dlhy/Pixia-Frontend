const API_BASE: string = process.env.API_BASE || "http://localhost:8000/api"

export type SendChatResponse = {
  session_id: string
  answer: string
  agent: string
  redirect_id: string
}

export type ChatSession = {
  session_id: string
  title: string
  document_type: string
}

export type FetchAllChatResponse = {
  sessions: ChatSession[]
}

export type DeepCourse = {
  deepcourse_id: string
  title: string
  completion: number
}

export type FetchAllDeepCoursesResponse = {
  sessions: DeepCourse[]
}

export type Chapter = {
  chapter_id: string
  title: string | null
  is_complete: boolean
}

export type FetchChaptersResponse = {
  chapters: Chapter[]
}

export type EventMessage = {
  type: "user" | "bot" | "system" | "unknown"
  text: string | null
  timestamp: string | null
}

export type FetchChatResponse = {
  session_id: string | null
  user_id: string
  messages?: EventMessage[]
  events?: Array<{ type?: string; text?: string | null; timestamp?: string | null }>
}

async function handle<T = any>(r: Response): Promise<T> {
  if (!r.ok) {
    const body = await r.text().catch(() => "")
    throw new Error(`HTTP ${r.status}: ${body}`)
  }
  return r.json() as Promise<T>
}

function extractMessageContent(text: string | null | undefined): string {
  if (!text) return ""
  
  const match = text.match(/\[ENDCONTEXT\]([\s\S]*)/i)
  
  if (match && match[1]) {
    const content = match[1].trim()
    if (content) {
      return content
    }
  }
  
  return text.trim()
}

export async function sendChat(
  data: FormData | { user_id: string; message: string; sessionId?: string }
): Promise<SendChatResponse> {
  let options: RequestInit

  // Extraire sessionId de manière sûre
  const sessionId = data instanceof FormData ? null : data.sessionId

  if (sessionId) {
    console.log("Envoi de message avec sessionId:", sessionId)
  }
  else {
    console.log("Envoi de message sans sessionId")
  }

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

  const r = await fetch(`${API_BASE}/chat`, options)
  return handle<SendChatResponse>(r)
}

export async function fetchAllChat(userId: string): Promise<FetchAllChatResponse> {

  const r = await fetch(`${API_BASE}/fetchallchats`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  })
  
  const result = await handle<FetchAllChatResponse>(r)
  
  if (!result || typeof result !== 'object' || !Array.isArray(result.sessions)) {
    console.warn(`[fetchAllChat] Réponse invalide du backend:`, result)
    return { sessions: [] }
  }
  
  
  return result
}

export async function fetchAllDeepCourses(userId: string): Promise<FetchAllDeepCoursesResponse> {
  
  const formData = new FormData()
  formData.append("user_id", userId)
  
  const r = await fetch(`${API_BASE}/fetchalldeepcourses`, {
    method: "POST",
    body: formData,
  })
  
  const result = await handle<FetchAllDeepCoursesResponse>(r)
  
  if (!result || typeof result !== 'object' || !Array.isArray(result.sessions)) {
    console.warn(`[fetchAllDeepCourses] Réponse invalide du backend:`, result)
    return { sessions: [] }
  }
  
  return result
}

export async function fetchChat(
  userId: string,
  sessionId: string
): Promise<FetchChatResponse> {
  
  const formData = new FormData()
  formData.append("user_id", userId)
  formData.append("session_id", sessionId)
  
  const r = await fetch(`${API_BASE}/fetchchat`, {
    method: "POST",
    body: formData,
  })
  
  const result = await handle<FetchChatResponse>(r)
  
  if (!result || typeof result !== 'object') {
    console.warn(`[fetchChat] Réponse invalide du backend:`, result)
    return { session_id: sessionId, user_id: userId, messages: [] }
  }
  
  let messages = result.messages || result.events || []
  
  if (!Array.isArray(messages)) {
    console.warn(`[fetchChat] messages/events n'est pas un array:`, typeof messages, messages)
    messages = []
  }
  
  const normalizedMessages = messages
    .map((m: any) => {
      let text: string | null = null
      
      if (typeof m === 'string') {
        text = extractMessageContent(m)
      } else if (m && typeof m === 'object') {
        text = extractMessageContent(m.text)
      }
      
      const type = (m && typeof m === 'object' ? m.type : undefined) || 'unknown'
      const timestamp = (m && typeof m === 'object' ? m.timestamp : undefined) || null
      
      return {
        type: type as 'user' | 'bot' | 'system' | 'unknown',
        text,
        timestamp
      }
    })
    .filter((m): m is EventMessage => m.text !== null && m.text !== '')
  
  return { 
    session_id: result.session_id || sessionId, 
    user_id: result.user_id || userId, 
    messages: normalizedMessages 
  }
}

export async function   fetchChapters(
  deepcourseId: string
): Promise<FetchChaptersResponse> {
  
  const formData = new FormData()
  formData.append("deepcourse_id", deepcourseId)
  
  const r = await fetch(`${API_BASE}/fetchallchapters`, {
    method: "POST",
    body: formData,
  })
  
  const result = await handle<FetchChaptersResponse>(r)
  
  if (!result || typeof result !== 'object' || !Array.isArray(result.chapters)) {
    console.warn(`[fetchChapters] Réponse invalide du backend:`, result)
    return { chapters: [] }
  }
  
  
  return result
}

export type MarkChapterCompleteResponse = {
  is_complete: boolean
}

export async function markChapterComplete(
  chapterId: string
): Promise<MarkChapterCompleteResponse> {
  
  const formData = new FormData()
  formData.append("chapter_id", chapterId)
  
  const r = await fetch(`${API_BASE}/markchaptercomplete`, {
    method: "PUT",
    body: formData,
  })
  
  const result = await handle<MarkChapterCompleteResponse>(r)
  
  if (!result || typeof result !== 'object' || typeof result.is_complete !== 'boolean') {
    console.warn(`[markChapterComplete] Réponse invalide du backend:`, result)
    return { is_complete: false }
  }
  
  return result
}

export async function markChapterUncomplete(
  chapterId: string
): Promise<MarkChapterCompleteResponse> {
  
  const formData = new FormData()
  formData.append("chapter_id", chapterId)
  
  const r = await fetch(`${API_BASE}/markchapteruncomplete`, {
    method: "PUT",
    body: formData,
  })
  
  const result = await handle<MarkChapterCompleteResponse>(r)
  
  if (!result || typeof result !== 'object' || typeof result.is_complete !== 'boolean') {
    console.warn(`[markChapterUncomplete] Réponse invalide du backend:`, result)
    return { is_complete: true }
  }
  
  return result
}

export type ChangeSettingsResponse = {
  user_id: string
  is_changed: boolean
}

export async function changeSettings(
  userId: string,
  newGivenName?: string,
  newNotionToken?: string,
  newNiveauEtude?: string
): Promise<ChangeSettingsResponse> {
  
  const formData = new FormData()
  formData.append("user_id", userId)
  if (newGivenName) formData.append("new_given_name", newGivenName)
  if (newNotionToken) formData.append("new_notion_token", newNotionToken)
  if (newNiveauEtude) formData.append("new_niveau_etude", newNiveauEtude)
  
  const r = await fetch(`${API_BASE}/changesettings`, {
    method: "PUT",
    body: formData,
  })
  
  const result = await handle<ChangeSettingsResponse>(r)
  
  if (!result || typeof result !== 'object' || typeof result.is_changed !== 'boolean') {
    console.warn(`[changeSettings] Réponse invalide du backend:`, result)
    return { user_id: userId, is_changed: false }
  }
  
  return result
}

export type FetchChapterDocumentsResponse = {
  chapter_id: string
  exercice_session_id: string
  course_session_id: string
  evaluation_session_id: string
}

export async function fetchChapterDocuments(
  chapterId: string
): Promise<FetchChapterDocumentsResponse> {
  
  const formData = new FormData()
  formData.append("chapter_id", chapterId)
  
  const r = await fetch(`${API_BASE}/fetchchapterdocument`, {
    method: "POST",
    body: formData,
  })
  
  const result = await handle<FetchChapterDocumentsResponse>(r)
  
  if (!result || typeof result !== 'object' || !result.chapter_id) {
    console.warn(`[fetchChapterDocuments] Réponse invalide du backend:`, result)
    return {
      chapter_id: chapterId,
      exercice_session_id: "",
      course_session_id: "",
      evaluation_session_id: ""
    }
  }
  
  return result
}

export type CorrectPlainQuestionResponse = {
  is_correct: boolean
  feedback?: string
}

export async function correctPlainQuestion(
  question: string,
  userAnswer: string,
  expectedAnswer: string
): Promise<boolean> {

  const r = await fetch(`${API_BASE}/correctplainquestion`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question, user_answer: userAnswer, expected_answer: expectedAnswer }),
  })

  const result = await handle<{ is_correct: boolean }>(r)

  if (!result || typeof result.is_correct !== "boolean") {
    console.warn(`[correctPlainQuestion] Réponse invalide du backend:`, result)
    return false
  }

  return result.is_correct
}

export async function correctAllPlainQuestions(
  questions: Array<{ question: string; user_answer: string; expected_answer: string }>
): Promise<CorrectPlainQuestionResponse[]> {

  const r = await fetch(`${API_BASE}/correctallquestions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ questions }),
  })

  const results = await handle<CorrectPlainQuestionResponse[]>(r)

  if (!Array.isArray(results)) {
    console.warn(`[correctAllPlainQuestions] Réponse invalide du backend:`, results)
    return []
  }

  return results.map(r => ({
    is_correct: r.is_correct,
    feedback: r.feedback || undefined,
  }))
}

export async function downloadCoursePdf(
  sessionId: string
): Promise<Blob> {
  const formData = new FormData()
  formData.append("session_id", sessionId)

  const r = await fetch(`${API_BASE}/downloadcourse`, {
    method: "POST",
    body: formData,
  })

  if (!r.ok) {
    const body = await r.text().catch(() => "")
    throw new Error(`HTTP ${r.status}: ${body}`)
  }

  return r.blob()
}
