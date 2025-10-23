import { createServerFn } from "@tanstack/react-start"
import z from "zod"
import { sendChat, fetchAllChat, fetchAllDeepCourses, fetchChat } from "./chatApi"
import { getExercise, getCourse } from "./document.server"
import { ExerciseOutput, CourseOutput, isExerciseOutput, isCourseOutput } from "~/models/Document"

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
  // 🎯 Contexte pour enrichissement du message
  messageContext: z
    .object({
      selectedCardType: z.enum(["cours", "exercice"]).optional(),
      currentRoute: z.enum(["chat", "deep-course", "course", "exercice"]).optional(),
      deepCourseId: z.string().optional(),
      userFullName: z.string().optional(),
    })
    .optional(),
})

// -------------------------
// 🔹 Fonction serveur
// -------------------------
export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator(ChatMessageSchema)
  .handler(async ({ data }) => {
    const { user_id, message, sessionId, files = [], messageContext } = data

    console.group("%c📨 [sendChatMessage] Input Reçu", "color: #3b82f6; font-weight: bold; font-size: 13px;")
    console.log("user_id:", user_id)
    console.log("message:", message)
    console.log("sessionId:", sessionId)
    console.log("messageContext:", messageContext)
    console.groupEnd()

    // 🎯 Enrichir le message avec le contexte
    let enrichedMessage = message
    if (messageContext) {
      const contextParts: string[] = []

      // ==================== NIVEAU MACRO ====================
      if (messageContext.userFullName) {
        contextParts.push(`[Utilisateur: ${messageContext.userFullName}]`)
      }

      // ==================== NIVEAU MICRO ====================
      const route = messageContext.currentRoute || "chat"
      const selectedCard = messageContext.selectedCardType

      switch (route) {
        case "chat":
          if (selectedCard === "cours") {
            contextParts.push(
              "l'utilisateur a indiqué qu'il souhaitait générer un nouveau cours"
            )
          } else if (selectedCard === "exercice") {
            contextParts.push(
              "l'utilisateur a indiqué qu'il souhaitait générer un nouvel exercice"
            )
          }
          break

        case "deep-course":
          if (messageContext.deepCourseId) {
            contextParts.push(
              `tu es un copilote deep course, l'utilisateur souhaite ajouter un chapitre au deep cours ${messageContext.deepCourseId}`
            )
          } else {
            contextParts.push(
              "l'utilisateur a indiqué qu'il souhaitait générer un nouveau cours approfondi"
            )
          }
          break

        case "course":
          contextParts.push("tu es un copilote cours")
          break

        case "exercice":
          contextParts.push("tu es un copilote exercice")
          break
      }

      if (contextParts.length > 0) {
        enrichedMessage = `${contextParts.join("\n")}\n\n[ENDCONTEXT]\n\n${message}`
        console.log(
          "%c🎯 [sendChatMessage] Message enrichi",
          "color: #8b5cf6; font-weight: bold; font-size: 12px;",
          enrichedMessage
        )
      }
    }

    const formData = new FormData()
    formData.append("user_id", user_id)
    formData.append("message", enrichedMessage)
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
      
      // Vérifier que res et res.messages existent
      if (!res) {
        console.warn(`⚠️ [getChat] fetchChat retourné null/undefined`)
        return []
      }
      
      if (!Array.isArray(res.messages)) {
        console.warn(`⚠️ [getChat] res.messages n'est pas un array:`, typeof res.messages, res.messages)
        return []
      }
      
      console.log(`✅ [getChat] ${res.messages.length} messages récupérés pour session: ${session_id}`)
      return res.messages
    } catch (error) {
      console.error(`❌ [getChat] Erreur:`, error)
      throw error
    }
  })

// ========================================================================================
// 🔹 COMBINÉ: Chat + Document (car doc_id === session_id dans la DB)
// ========================================================================================

// -------------------------
// 🔹 Validation pour getChatWithDocument
// -------------------------
const FetchChatWithDocumentSchema = z.object({
  user_id: z.string().min(1),
  session_id: z.string().min(1),
  doc_type: z.enum(["exercise", "course"]).optional(),
})

export interface ChatWithDocumentResponse {
  messages: Array<{ type?: string; text: string | null; timestamp?: string | null }>
  document: ExerciseOutput | CourseOutput | null
  documentType: "exercise" | "course" | null
}

// -------------------------
// 🔹 Server Function: Récupérer chat ET document combinés
// -------------------------
export const getChatWithDocument = createServerFn({ method: "POST" })
  .inputValidator(FetchChatWithDocumentSchema)
  .handler(async ({ data }): Promise<ChatWithDocumentResponse> => {
    const { user_id, session_id, doc_type } = data

    try {
      console.group(`%c� [SERVER] getChatWithDocument Input`, 'color: #3b82f6; font-weight: bold; font-size: 13px;')
      console.log(`👤 user_id: ${user_id}`)
      console.log(`📍 session_id: ${session_id}`)
      console.log(`🏷️ doc_type: ${doc_type || 'auto-detect'}`)
      console.groupEnd()

      // Récupérer le chat en parallèle avec les document(s)
      console.group(`%c🚀 [SERVER] Making parallel API calls`, 'color: #8b5cf6; font-weight: bold; font-size: 13px;')
      console.log(`👤 user_id VALUE CHECK: ${user_id} (type: ${typeof user_id})`)
      console.log(`1️⃣ fetchChat(user_id=${user_id}, session_id=${session_id})`)
      console.log(`2️⃣ getExercise(session_id=${session_id}) - ${doc_type !== "course" ? "YES" : "NO"}`)
      console.log(`3️⃣ getCourse(session_id=${session_id}) - ${doc_type !== "exercise" ? "YES" : "NO"}`)
      console.groupEnd()

      const [chatRes, exerciseRes, courseRes] = await Promise.allSettled([
        fetchChat(user_id, session_id),
        doc_type !== "course" ? getExercise({ data: { session_id } }) : Promise.resolve(null),
        doc_type !== "exercise" ? getCourse({ data: { session_id } }) : Promise.resolve(null),
      ])

      // Extraire les messages du chat
      let messages: ChatWithDocumentResponse["messages"] = []
      if (chatRes.status === "fulfilled") {
        messages = chatRes.value.messages as any
        console.group(`%c✅ [SERVER] Chat Response`, 'color: #10b981; font-weight: bold; font-size: 13px;')
        console.log(`📨 ${messages.length} messages`)
        console.log(`📋 Messages:`, messages)
        console.groupEnd()
      } else {
        console.group(`%c⚠️ [SERVER] Chat Error`, 'color: #f59e0b; font-weight: bold; font-size: 13px;')
        console.log(`Error:`, chatRes.reason)
        console.groupEnd()
      }

      // Extraire le document (priorité: exercise → course → null)
      let document: ExerciseOutput | CourseOutput | null = null
      let documentType: "exercise" | "course" | null = null

      console.group(`%c🔍 [SERVER] Document Resolution`, 'color: #ec4899; font-weight: bold; font-size: 13px;')
      
      if (exerciseRes.status === "fulfilled" && exerciseRes.value && isExerciseOutput(exerciseRes.value)) {
        document = exerciseRes.value
        documentType = "exercise"
        console.log(`✅ Exercise found and valid!`)
        console.log(`📦 Exercise structure:`, {
          hasExercises: 'exercises' in document,
          exercisesCount: (document as any).exercises?.length || 0,
        })
        console.log(`📄 Full Exercise:`, document)
      } else {
        console.log(`❌ Exercise not found or invalid`)
        console.log(`exerciseRes.status: ${exerciseRes.status}`)
        if (exerciseRes.status === "fulfilled") {
          console.log(`exerciseRes.value:`, exerciseRes.value)
          console.log(`isExerciseOutput check:`, isExerciseOutput(exerciseRes.value))
        } else {
          console.log(`exerciseRes.reason:`, exerciseRes.reason)
        }
      }

      if (!document && courseRes.status === "fulfilled" && courseRes.value && isCourseOutput(courseRes.value)) {
        document = courseRes.value
        documentType = "course"
        console.log(`✅ Course found and valid!`)
        console.log(`📦 Course structure:`, {
          hasTitle: 'title' in document,
          hasChapters: 'chapters' in document,
          chaptersCount: (document as any).chapters?.length || 0,
        })
      } else if (!document) {
        console.log(`❌ Course not found or invalid`)
        if (courseRes.status === "fulfilled") {
          console.log(`courseRes.value:`, courseRes.value)
          console.log(`isCourseOutput check:`, isCourseOutput(courseRes.value))
        } else {
          console.log(`courseRes.reason:`, courseRes.reason)
        }
      }

      if (!document) {
        console.log(`⚠️ NO VALID DOCUMENT FOUND`)
      }
      
      console.groupEnd()

      console.group(`%c📤 [SERVER] getChatWithDocument Output`, 'color: #06b6d4; font-weight: bold; font-size: 13px;')
      console.log(`💬 messages: ${messages.length}`)
      console.log(`📦 documentType: ${documentType}`)
      console.log(`📊 Full response:`, { messages, documentType, document })
      console.groupEnd()

      return {
        messages,
        document,
        documentType,
      }
    } catch (error) {
      console.group(`%c❌ [SERVER] getChatWithDocument Error`, 'color: #ef4444; font-weight: bold; font-size: 13px;')
      console.log(`Error message:`, error instanceof Error ? error.message : String(error))
      console.log(`Full error:`, error)
      console.groupEnd()
      throw error
    }
  })
