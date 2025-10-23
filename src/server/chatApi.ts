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

/**
 * Extrait le contenu du message après la balise [ENDCONTEXT]
 * 
 * Format attendu:
 * [Indications pour le bot]
 * [ENDCONTEXT]
 * [Contenu du message à afficher]
 * 
 * Si la balise est présente, retourne UNIQUEMENT ce qui vient après
 * Si la balise n'est pas présente, retourne le texte entier
 */
function extractMessageContent(text: string | null | undefined): string {
  if (!text) return ""
  
  // Regex pour extraire tout ce qui vient après [ENDCONTEXT]
  // Cherche [ENDCONTEXT] (case-insensitive) et capture tout après
  const match = text.match(/\[ENDCONTEXT\]([\s\S]*)/i)
  
  if (match && match[1]) {
    // On prend le groupe capturé (tout après la balise) et on trim
    const content = match[1].trim()
    // Ne retourner que si y'a du contenu après la balise
    if (content) {
      return content
    }
  }
  
  // Si pas de balise trouvée OU si rien après la balise, retourner le texte entier
  return text.trim()
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
  console.log(`📡 [sendChat] Envoi du message :\n  - user_id: ${(data instanceof FormData) ? data.get("user_id") : data.user_id}\n  - session_id: ${(data instanceof FormData) ? data.get("session_id") : data.sessionId}\n  - message: ${(data instanceof FormData) ? data.get("message") : data.message}`)

  const r = await fetch(`${API_BASE}/chat`, options)
  return handle<SendChatResponse>(r)
}

// -------------------------
// 🔹 Récupérer toutes les sessions de chat
// -------------------------
export async function fetchAllChat(userId: string): Promise<FetchAllChatResponse> {
  console.log(`📡 [fetchAllChat] Appel API pour user_id: ${userId}`)
  
  const r = await fetch(`${API_BASE}/fetchallchats`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  })
  
  const result = await handle<FetchAllChatResponse>(r)
  
  // Vérification défensive
  if (!result || typeof result !== 'object' || !Array.isArray(result.sessions)) {
    console.warn(`⚠️ [fetchAllChat] Réponse invalide du backend:`, result)
    return { sessions: [] }
  }
  
  console.log(`📡 [fetchAllChat] ${result.sessions.length} sessions récupérées`)
  
  return result
}

// -------------------------
// 🔹 Récupérer tous les deep-courses
// -------------------------
export async function fetchAllDeepCourses(userId: string): Promise<FetchAllDeepCoursesResponse> {
  console.log(`📡 [fetchAllDeepCourses] Appel API pour user_id: ${userId}`)
  
  const formData = new FormData()
  formData.append("user_id", userId)
  
  const r = await fetch(`${API_BASE}/fetchalldeepcourses`, {
    method: "POST",
    body: formData,
  })
  
  const result = await handle<FetchAllDeepCoursesResponse>(r)
  
  // Vérification défensive
  if (!result || typeof result !== 'object' || !Array.isArray(result.sessions)) {
    console.warn(`⚠️ [fetchAllDeepCourses] Réponse invalide du backend:`, result)
    return { sessions: [] }
  }
  
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
  console.log(`📡 [fetchChat] user_id is ${userId === "" ? "EMPTY STRING" : userId === null ? "NULL" : userId === undefined ? "UNDEFINED" : "OK"}`)
  
  // Utiliser FormData pour passer les paramètres comme le backend l'attend
  const formData = new FormData()
  formData.append("user_id", userId)
  formData.append("session_id", sessionId)
  
  const r = await fetch(`${API_BASE}/fetchchat`, {
    method: "POST",
    body: formData,
  })
  
  const result = await handle<FetchChatResponse>(r)
  
  // Vérification défensive: s'assurer que result a les bonnes propriétés
  if (!result || typeof result !== 'object') {
    console.warn(`⚠️ [fetchChat] Réponse invalide du backend:`, result)
    return { session_id: sessionId, user_id: userId, messages: [] }
  }
  
  // Le backend retourne soit 'messages' soit 'events' - les normaliser en 'messages'
  let messages = result.messages || result.events || []
  
  if (!Array.isArray(messages)) {
    console.warn(`⚠️ [fetchChat] messages/events n'est pas un array:`, typeof messages, messages)
    messages = []
  }
  
  // Convertir les events en EventMessage si nécessaire
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
  
  console.log(`📡 [fetchChat] ${normalizedMessages.length} messages récupérés`)
  
  return { 
    session_id: result.session_id || sessionId, 
    user_id: result.user_id || userId, 
    messages: normalizedMessages 
  }
}

// -------------------------
// 🔹 Récupérer les chapitres d'un deep-course
// -------------------------
export async function   fetchChapters(
  deepcourseId: string
): Promise<FetchChaptersResponse> {
  console.log(`📡 [fetchChapters] Appel API pour deepcourse_id: ${deepcourseId}`)
  
  const formData = new FormData()
  formData.append("deepcourse_id", deepcourseId)
  
  const r = await fetch(`${API_BASE}/fetchallchapters`, {
    method: "POST",
    body: formData,
  })
  
  const result = await handle<FetchChaptersResponse>(r)
  
  // Vérification défensive
  if (!result || typeof result !== 'object' || !Array.isArray(result.chapters)) {
    console.warn(`⚠️ [fetchChapters] Réponse invalide du backend:`, result)
    return { chapters: [] }
  }
  
  console.log(`📡 [fetchChapters] ${result.chapters.length} chapitres récupérés`)
  
  return result
}

// -------------------------
// 🔹 Marquer un chapitre comme complet
// -------------------------
export type MarkChapterCompleteResponse = {
  is_complete: boolean
}

export async function markChapterComplete(
  chapterId: string
): Promise<MarkChapterCompleteResponse> {
  console.log(`📡 [markChapterComplete] Marquage du chapitre comme complet: ${chapterId}`)
  
  const formData = new FormData()
  formData.append("chapter_id", chapterId)
  
  const r = await fetch(`${API_BASE}/markchaptercomplete`, {
    method: "PUT",
    body: formData,
  })
  
  const result = await handle<MarkChapterCompleteResponse>(r)
  
  // Vérification défensive
  if (!result || typeof result !== 'object' || typeof result.is_complete !== 'boolean') {
    console.warn(`⚠️ [markChapterComplete] Réponse invalide du backend:`, result)
    return { is_complete: false }
  }
  
  console.log(`✅ [markChapterComplete] Chapitre ${chapterId} marqué comme complet`)
  
  return result
}

// -------------------------
// 🔹 Marquer un chapitre comme incomplet
// -------------------------
export async function markChapterUncomplete(
  chapterId: string
): Promise<MarkChapterCompleteResponse> {
  console.log(`📡 [markChapterUncomplete] Marquage du chapitre comme incomplet: ${chapterId}`)
  
  const formData = new FormData()
  formData.append("chapter_id", chapterId)
  
  const r = await fetch(`${API_BASE}/markchapteruncomplete`, {
    method: "PUT",
    body: formData,
  })
  
  const result = await handle<MarkChapterCompleteResponse>(r)
  
  // Vérification défensive
  if (!result || typeof result !== 'object' || typeof result.is_complete !== 'boolean') {
    console.warn(`⚠️ [markChapterUncomplete] Réponse invalide du backend:`, result)
    return { is_complete: true }
  }
  
  console.log(`✅ [markChapterUncomplete] Chapitre ${chapterId} marqué comme incomplet`)
  
  return result
}

// -------------------------
// 🔹 Changer les paramètres utilisateur
// -------------------------
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
  console.log(`📡 [changeSettings] Mise à jour des paramètres pour user_id: ${userId}`)
  
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
  
  // Vérification défensive
  if (!result || typeof result !== 'object' || typeof result.is_changed !== 'boolean') {
    console.warn(`⚠️ [changeSettings] Réponse invalide du backend:`, result)
    return { user_id: userId, is_changed: false }
  }
  
  console.log(`✅ [changeSettings] Paramètres mis à jour pour user_id: ${userId}`)
  
  return result
}
