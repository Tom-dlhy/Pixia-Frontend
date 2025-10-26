import { createServerFn } from "@tanstack/react-start"
import z from "zod"
import { sendChat, fetchAllChat, fetchAllDeepCourses, fetchChat, fetchChapters, markChapterComplete, markChapterUncomplete, changeSettings, fetchChapterDocuments, correctPlainQuestion } from "./chatApi"
import { getExercise, getCourse } from "./document.server"
import { ExerciseOutput, CourseOutput, isExerciseOutput, isCourseOutput } from "~/models/Document"

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
        data: z.string(), 
      })
    )
    .optional(),
  messageContext: z
    .object({
      selectedCardType: z.enum(["cours", "exercice"]).optional(),
      currentRoute: z.enum(["chat", "deep-course", "course", "exercice"]).optional(),
      deepCourseId: z.string().optional(),
      userFullName: z.string().optional(),
    })
    .optional(),
})

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator(ChatMessageSchema)
  .handler(async ({ data }) => {
    const { user_id, message, sessionId, files = [], messageContext } = data

    console.group("%c📨 [sendChatMessage] Input Reçu", "color: #3b82f6; font-weight: bold; font-size: 13px;")
    console.groupEnd()

    let enrichedMessage = message
    if (messageContext) {
      const contextParts: string[] = []

      if (messageContext.userFullName) {
        contextParts.push(`[Utilisateur: ${messageContext.userFullName}]`)
      }

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

    return {
      reply: res.answer,
      session_id: res.session_id,
      agent: res.agent,
      redirect_id: res.redirect_id,
    }
  })

const FetchAllChatSchema = z.object({
  user_id: z.string().min(1),
})

export const getAllChatSessions = createServerFn({ method: "POST" })
  .inputValidator(FetchAllChatSchema)
  .handler(async ({ data }) => {
    const { user_id } = data

    try {
      const res = await fetchAllChat(user_id)
      return res.sessions
    } catch (error) {
      console.error(`[getAllChatSessions] Erreur:`, error)
      throw error
    }
  })

const FetchAllDeepCoursesSchema = z.object({
  user_id: z.string().min(1),
})

export const getAllDeepCourses = createServerFn({ method: "POST" })
  .inputValidator(FetchAllDeepCoursesSchema)
  .handler(async ({ data }) => {
    const { user_id } = data

    try {
      const res = await fetchAllDeepCourses(user_id)
      return res.sessions
    } catch (error) {
      console.error(`[getAllDeepCourses] Erreur:`, error)
      throw error
    }
  })

const FetchChatSchema = z.object({
  user_id: z.string().min(1),
  session_id: z.string().min(1),
})

export const getChat = createServerFn({ method: "POST" })
  .inputValidator(FetchChatSchema)
  .handler(async ({ data }) => {
    const { user_id, session_id } = data

    try {
      const res = await fetchChat(user_id, session_id)
      
      if (!res) {
        console.warn(`[getChat] fetchChat retourné null/undefined`)
        return []
      }
      
      if (!Array.isArray(res.messages)) {
        return []
      }
      
      return res.messages
    } catch (error) {
      console.error(`[getChat] Erreur:`, error)
      throw error
    }
  })

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

export const getChatWithDocument = createServerFn({ method: "POST" })
  .inputValidator(FetchChatWithDocumentSchema)
  .handler(async ({ data }): Promise<ChatWithDocumentResponse> => {
    const { user_id, session_id, doc_type } = data

    try {

      let document: ExerciseOutput | CourseOutput | null = null
      let documentType: "exercise" | "course" | null = null

      if (doc_type === "exercise") {
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
      console.error(`[getChatWithDocument] Erreur:`, error)
      throw error
    }
  })

const FetchChaptersSchema = z.object({
  deepcourse_id: z.string().min(1),
})

export const getChapters = createServerFn({ method: "POST" })
  .inputValidator(FetchChaptersSchema)
  .handler(async ({ data }) => {
    const { deepcourse_id } = data

    try {
      const res = await fetchChapters(deepcourse_id)

      if (!res) {
        console.warn(`[getChapters] fetchChapters retourné null/undefined`)
        return []
      }

      if (!Array.isArray(res.chapters)) {
        console.warn(`[getChapters] res.chapters n'est pas un array:`, typeof res.chapters, res.chapters)
        return []
      }

      return res.chapters
    } catch (error) {
      console.error(`[getChapters] Erreur:`, error)
      throw error
    }
  })

const MarkChapterCompleteSchema = z.object({
  chapter_id: z.string().min(1),
})

export const markChapterCompleteServerFn = createServerFn({ method: "POST" })
  .inputValidator(MarkChapterCompleteSchema)
  .handler(async ({ data }) => {
    const { chapter_id } = data

    try {
      const res = await markChapterComplete(chapter_id)

      if (!res || typeof res !== 'object' || typeof res.is_complete !== 'boolean') {
        console.warn(`[markChapterCompleteServerFn] Réponse invalide du backend:`, res)
        return { is_complete: false }
      }

      return res
    } catch (error) {
      console.error(`[markChapterCompleteServerFn] Erreur:`, error)
      throw error
    }
  })

const MarkChapterUncompleteSchema = z.object({
  chapter_id: z.string().min(1),
})

export const markChapterUncompleteServerFn = createServerFn({ method: "POST" })
  .inputValidator(MarkChapterUncompleteSchema)
  .handler(async ({ data }) => {
    const { chapter_id } = data

    try {
      const res = await markChapterUncomplete(chapter_id)

      if (!res || typeof res !== 'object' || typeof res.is_complete !== 'boolean') {
        console.warn(`[markChapterUncompleteServerFn] Réponse invalide du backend:`, res)
        return { is_complete: true }
      }

      return res
    } catch (error) {
      console.error(`[markChapterUncompleteServerFn] Erreur:`, error)
      throw error
    }
  })

const ChangeSettingsSchema = z.object({
  user_id: z.string().min(1),
  new_given_name: z.string().optional(),
  new_notion_token: z.string().optional(),
  new_niveau_etude: z.string().optional(),
})

export const updateSettingsServerFn = createServerFn({ method: "POST" })
  .inputValidator(ChangeSettingsSchema)
  .handler(async ({ data }) => {
    const { user_id, new_given_name, new_notion_token, new_niveau_etude } = data

    try {
      const res = await changeSettings(user_id, new_given_name, new_notion_token, new_niveau_etude)

      if (!res || typeof res !== 'object' || typeof res.is_changed !== 'boolean') {
        console.warn(`[updateSettingsServerFn] Réponse invalide du backend:`, res)
        return { user_id, is_changed: false }
      }

      return res
    } catch (error) {
      console.error(`[updateSettingsServerFn] Erreur:`, error)
      throw error
    }
  })

const FetchChapterDocumentsSchema = z.object({
  chapter_id: z.string().min(1),
})

export const getChapterDocuments = createServerFn({ method: "POST" })
  .inputValidator(FetchChapterDocumentsSchema)
  .handler(async ({ data }) => {
    const { chapter_id } = data

    try {
      const res = await fetchChapterDocuments(chapter_id)

      if (!res || typeof res !== 'object' || !res.chapter_id) {
        console.warn(`[getChapterDocuments] Réponse invalide du backend:`, res)
        return {
          chapter_id,
          exercice_session_id: "",
          course_session_id: "",
          evaluation_session_id: ""
        }
      }

      return res
    } catch (error) {
      console.error(`[getChapterDocuments] Erreur:`, error)
      throw error
    }
  })

const CheckPlainQuestionSchema = z.object({
  question: z.string().min(1),
  user_answer: z.string().min(1),
  expected_answer: z.string().min(1),
})

export interface CheckPlainQuestionResponse {
  is_correct: boolean
  feedback?: string
}

export const checkPlainQuestion = createServerFn({ method: "POST" })
  .inputValidator(CheckPlainQuestionSchema)
  .handler(async ({ data }): Promise<CheckPlainQuestionResponse> => {
    const { question, user_answer, expected_answer } = data

    try {

      const res = await correctPlainQuestion(question, user_answer, expected_answer)

      if (!res || typeof res.is_correct !== "boolean") {
        console.warn(`[checkPlainQuestion] Réponse invalide du backend:`, res)
        return { is_correct: false, feedback: "Erreur lors de la correction" }
      }

      return {
        is_correct: res.is_correct,
        feedback: res.feedback || undefined,
      }
    } catch (error) {
      console.error(`[checkPlainQuestion] Erreur:`, error)
      throw error
    }
  })
