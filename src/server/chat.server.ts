import { createServerFn } from "@tanstack/react-start"
import z from "zod"
import { sendChat, fetchAllChat, fetchAllDeepCourses, fetchChat, fetchChapters, markChapterComplete, markChapterUncomplete, changeSettings, fetchChapterDocuments, correctPlainQuestion } from "./chatApi"
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
// 🔹 OPTIMISÉ: Chat + Document avec logique ciblée
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
// 🔹 Server Function: Récupérer chat ET document combinés (OPTIMISÉ)
// -------------------------
export const getChatWithDocument = createServerFn({ method: "POST" })
  .inputValidator(FetchChatWithDocumentSchema)
  .handler(async ({ data }): Promise<ChatWithDocumentResponse> => {
    const { user_id, session_id, doc_type } = data

    try {
      console.log(`📡 [getChatWithDocument] user_id: ${user_id}, session_id: ${session_id}, doc_type: ${doc_type || "auto"}`)

      // 🎯 Charger SEULEMENT ce qu'on a besoin
      let document: ExerciseOutput | CourseOutput | null = null
      let documentType: "exercise" | "course" | null = null

      if (doc_type === "exercise") {
        console.log(`📡 [getChatWithDocument] Chargement exercise + chat`)
        const [exercise, history] = await Promise.all([
          getExercise({ data: { session_id } }),
          fetchChat(user_id, session_id),
        ])
        document = exercise
        documentType = "exercise"
        return {
          messages: history?.messages || [],
          document,
          documentType,
        }
      } 
      else if (doc_type === "course") {
        console.log(`📡 [getChatWithDocument] Chargement course + chat`)
        const [course, history] = await Promise.all([
          getCourse({ data: { session_id } }),
          fetchChat(user_id, session_id),
        ])
        document = course
        documentType = "course"
        return {
          messages: history?.messages || [],
          document,
          documentType,
        }
      }
      else {
        // Auto-detect: essayer exercise d'abord, puis course
        console.log(`📡 [getChatWithDocument] Auto-detect: chargement exercise + course + chat`)
        const [exercise, course, history] = await Promise.all([
          getExercise({ data: { session_id } }).catch(() => null),
          getCourse({ data: { session_id } }).catch(() => null),
          fetchChat(user_id, session_id),
        ])

        if (exercise && isExerciseOutput(exercise)) {
          document = exercise
          documentType = "exercise"
        } else if (course && isCourseOutput(course)) {
          document = course
          documentType = "course"
        }

        return {
          messages: history?.messages || [],
          document,
          documentType,
        }
      }
    } catch (error) {
      console.error(`❌ [getChatWithDocument] Erreur:`, error)
      throw error
    }
  })

// ========================================================================================
// 🔹 Chapters: Récupérer les chapitres d'un deep-course
// ========================================================================================

// -------------------------
// 🔹 Validation pour getChapters
// -------------------------
const FetchChaptersSchema = z.object({
  deepcourse_id: z.string().min(1),
})

// -------------------------
// 🔹 Server Function: Récupérer les chapitres d'un deep-course
// -------------------------
export const getChapters = createServerFn({ method: "POST" })
  .inputValidator(FetchChaptersSchema)
  .handler(async ({ data }) => {
    const { deepcourse_id } = data

    try {
      console.log(`📡 [getChapters] Récupération des chapitres pour deepcourse_id: ${deepcourse_id}`)
      const res = await fetchChapters(deepcourse_id)

      // Vérifier que res et res.chapters existent
      if (!res) {
        console.warn(`⚠️ [getChapters] fetchChapters retourné null/undefined`)
        return []
      }

      if (!Array.isArray(res.chapters)) {
        console.warn(`⚠️ [getChapters] res.chapters n'est pas un array:`, typeof res.chapters, res.chapters)
        return []
      }

      console.log(`✅ [getChapters] ${res.chapters.length} chapitres récupérés pour deepcourse: ${deepcourse_id}`)
      return res.chapters
    } catch (error) {
      console.error(`❌ [getChapters] Erreur:`, error)
      throw error
    }
  })

// ========================================================================================
// 🔹 Mark Chapter Complete
// ========================================================================================

// -------------------------
// 🔹 Validation pour markChapterComplete
// -------------------------
const MarkChapterCompleteSchema = z.object({
  chapter_id: z.string().min(1),
})

// -------------------------
// 🔹 Server Function: Marquer un chapitre comme complet
// -------------------------
export const markChapterCompleteServerFn = createServerFn({ method: "POST" })
  .inputValidator(MarkChapterCompleteSchema)
  .handler(async ({ data }) => {
    const { chapter_id } = data

    try {
      console.log(`📡 [markChapterCompleteServerFn] Marquage du chapitre: ${chapter_id}`)
      const res = await markChapterComplete(chapter_id)

      if (!res || typeof res !== 'object' || typeof res.is_complete !== 'boolean') {
        console.warn(`⚠️ [markChapterCompleteServerFn] Réponse invalide du backend:`, res)
        return { is_complete: false }
      }

      console.log(`✅ [markChapterCompleteServerFn] Chapitre ${chapter_id} marqué comme complet`)
      return res
    } catch (error) {
      console.error(`❌ [markChapterCompleteServerFn] Erreur:`, error)
      throw error
    }
  })

// ========================================================================================
// 🔹 Mark Chapter Uncomplete
// ========================================================================================

// -------------------------
// 🔹 Validation pour markChapterUncomplete
// -------------------------
const MarkChapterUncompleteSchema = z.object({
  chapter_id: z.string().min(1),
})

// -------------------------
// 🔹 Server Function: Marquer un chapitre comme incomplet
// -------------------------
export const markChapterUncompleteServerFn = createServerFn({ method: "POST" })
  .inputValidator(MarkChapterUncompleteSchema)
  .handler(async ({ data }) => {
    const { chapter_id } = data

    try {
      console.log(`📡 [markChapterUncompleteServerFn] Marquage du chapitre: ${chapter_id}`)
      const res = await markChapterUncomplete(chapter_id)

      if (!res || typeof res !== 'object' || typeof res.is_complete !== 'boolean') {
        console.warn(`⚠️ [markChapterUncompleteServerFn] Réponse invalide du backend:`, res)
        return { is_complete: true }
      }

      console.log(`✅ [markChapterUncompleteServerFn] Chapitre ${chapter_id} marqué comme incomplet`)
      return res
    } catch (error) {
      console.error(`❌ [markChapterUncompleteServerFn] Erreur:`, error)
      throw error
    }
  })

// ========================================================================================
// 🔹 Change Settings
// ========================================================================================

// -------------------------
// 🔹 Validation pour changeSettings
// -------------------------
const ChangeSettingsSchema = z.object({
  user_id: z.string().min(1),
  new_given_name: z.string().optional(),
  new_notion_token: z.string().optional(),
  new_niveau_etude: z.string().optional(),
})

// -------------------------
// 🔹 Server Function: Changer les paramètres utilisateur
// -------------------------
export const updateSettingsServerFn = createServerFn({ method: "POST" })
  .inputValidator(ChangeSettingsSchema)
  .handler(async ({ data }) => {
    const { user_id, new_given_name, new_notion_token, new_niveau_etude } = data

    try {
      console.log(`📡 [updateSettingsServerFn] Mise à jour des paramètres pour user_id: ${user_id}`)
      const res = await changeSettings(user_id, new_given_name, new_notion_token, new_niveau_etude)

      if (!res || typeof res !== 'object' || typeof res.is_changed !== 'boolean') {
        console.warn(`⚠️ [updateSettingsServerFn] Réponse invalide du backend:`, res)
        return { user_id, is_changed: false }
      }

      console.log(`✅ [updateSettingsServerFn] Paramètres mis à jour pour user_id: ${user_id}`)
      return res
    } catch (error) {
      console.error(`❌ [updateSettingsServerFn] Erreur:`, error)
      throw error
    }
  })

// -------------------------
// 🔹 Récupérer les documents d'un chapitre
// -------------------------
const FetchChapterDocumentsSchema = z.object({
  chapter_id: z.string().min(1),
})

export const getChapterDocuments = createServerFn({ method: "POST" })
  .inputValidator(FetchChapterDocumentsSchema)
  .handler(async ({ data }) => {
    const { chapter_id } = data

    try {
      console.log(`📡 [getChapterDocuments] Récupération des documents pour chapter_id: ${chapter_id}`)
      const res = await fetchChapterDocuments(chapter_id)

      if (!res || typeof res !== 'object' || !res.chapter_id) {
        console.warn(`⚠️ [getChapterDocuments] Réponse invalide du backend:`, res)
        return {
          chapter_id,
          exercice_session_id: "",
          course_session_id: "",
          evaluation_session_id: ""
        }
      }

      console.log(`✅ [getChapterDocuments] Documents récupérés pour chapter_id: ${chapter_id}`)
      return res
    } catch (error) {
      console.error(`❌ [getChapterDocuments] Erreur:`, error)
      throw error
    }
  })

// ========================================================================================
// 🔹 Corriger une question plain text
// ========================================================================================

// -------------------------
// 🔹 Validation pour checkPlainQuestion
// -------------------------
const CheckPlainQuestionSchema = z.object({
  question: z.string().min(1),
  user_answer: z.string().min(1),
  expected_answer: z.string().min(1),
})

export interface CheckPlainQuestionResponse {
  is_correct: boolean
  feedback?: string
}

// -------------------------
// 🔹 Server Function: Corriger une question plain text
// -------------------------
export const checkPlainQuestion = createServerFn({ method: "POST" })
  .inputValidator(CheckPlainQuestionSchema)
  .handler(async ({ data }): Promise<CheckPlainQuestionResponse> => {
    const { question, user_answer, expected_answer } = data

    try {
      console.log(`📡 [checkPlainQuestion] Correction d'une question`)
      console.log(`  Question: ${question.substring(0, 50)}...`)
      console.log(`  Réponse utilisateur: ${user_answer.substring(0, 50)}...`)
      console.log(`  Réponse attendue: ${expected_answer.substring(0, 50)}...`)

      const res = await correctPlainQuestion(question, user_answer, expected_answer)

      if (!res || typeof res.is_correct !== "boolean") {
        console.warn(`⚠️ [checkPlainQuestion] Réponse invalide du backend:`, res)
        return { is_correct: false, feedback: "Erreur lors de la correction" }
      }

      console.log(`✅ [checkPlainQuestion] Correction effectuée - is_correct: ${res.is_correct}`)
      return {
        is_correct: res.is_correct,
        feedback: res.feedback || undefined,
      }
    } catch (error) {
      console.error(`❌ [checkPlainQuestion] Erreur:`, error)
      throw error
    }
  })
