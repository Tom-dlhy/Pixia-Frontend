import { createServerFn } from "@tanstack/react-start"
import z from "zod"
import { sendChat, fetchAllChat, fetchAllDeepCourses, fetchChat } from "./chatApi"

// -------------------------
// 🔹 Validation des entrées
// -------------------------
const ChatMessageSchema = z.object({
  user_id: z.string().min(1),
  message: z.string().min(1),
  sessionId: z.string().min(1).optional(),
  files: z
    .array(
      z.object({
        name: z.string(),
        type: z.string().optional(),
        size: z.number().optional(),
        data: z.string(), // base64
      })
    )
    .optional(),
})

// -------------------------
// 🔹 Fonction serveur
// -------------------------
export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator(ChatMessageSchema)
  .handler(async ({ data }) => {
    const { user_id, message, sessionId, files = [] } = data

    const formData = new FormData()
    formData.append("user_id", user_id)
    formData.append("message", message)
    if (sessionId) formData.append("session_id", sessionId)

    for (const f of files) {
      const buffer = Buffer.from(f.data, "base64")
      const blob = new Blob([buffer], {
        type: f.type ?? "application/octet-stream",
      })
      formData.append("files", blob, f.name)
    }

    const res = await sendChat(formData)

    console.log("📡 RAW API RESPONSE (type):", typeof res)
    console.log("📡 RAW API RESPONSE (full):", JSON.stringify(res, null, 2))
    console.log("📡 session_id exists?", "session_id" in res, res.session_id)

    // ✅ Mapping backend → frontend
    return {
      reply: res.answer,
      session_id: res.session_id,
      agent: res.agent,
      redirect_id: res.redirect_id,
    }
  })

// -------------------------
// 🔹 Validation pour fetchAllChat
// -------------------------
const FetchAllChatSchema = z.object({
  user_id: z.string().min(1),
})

// -------------------------
// 🔹 Server Function: Récupérer toutes les sessions
// -------------------------
export const getAllChatSessions = createServerFn({ method: "POST" })
  .inputValidator(FetchAllChatSchema)
  .handler(async ({ data }) => {
    const { user_id } = data

    try {
      const res = await fetchAllChat(user_id)
      console.log(`✅ [getAllChatSessions] ${res.sessions.length} sessions récupérées`)
      return res.sessions
    } catch (error) {
      console.error(`❌ [getAllChatSessions] Erreur:`, error)
      throw error
    }
  })

// -------------------------
// 🔹 Validation pour fetchAllDeepCourses
// -------------------------
const FetchAllDeepCoursesSchema = z.object({
  user_id: z.string().min(1),
})

// -------------------------
// 🔹 Server Function: Récupérer tous les deep-courses
// -------------------------
export const getAllDeepCourses = createServerFn({ method: "POST" })
  .inputValidator(FetchAllDeepCoursesSchema)
  .handler(async ({ data }) => {
    const { user_id } = data

    try {
      const res = await fetchAllDeepCourses(user_id)
      console.log(`✅ [getAllDeepCourses] ${res.sessions.length} deep-courses récupérés`)
      return res.sessions
    } catch (error) {
      console.error(`❌ [getAllDeepCourses] Erreur:`, error)
      throw error
    }
  })

// -------------------------
// 🔹 Validation pour fetchChat
// -------------------------
const FetchChatSchema = z.object({
  user_id: z.string().min(1),
  session_id: z.string().min(1),
})

// -------------------------
// 🔹 Server Function: Récupérer l'historique d'une session
// -------------------------
export const getChat = createServerFn({ method: "POST" })
  .inputValidator(FetchChatSchema)
  .handler(async ({ data }) => {
    const { user_id, session_id } = data

    try {
      const res = await fetchChat(user_id, session_id)
      console.log(`✅ [getChat] ${res.messages.length} messages récupérés pour session: ${session_id}`)
      return res.messages
    } catch (error) {
      console.error(`❌ [getChat] Erreur:`, error)
      throw error
    }
  })
