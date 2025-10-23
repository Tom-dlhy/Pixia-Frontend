import { useEffect, useState } from "react"
import { ExerciseOutput, CourseOutput, isExerciseOutput, isCourseOutput } from "~/models/Document"
import { getExercise, getCourse, getDocument } from "~/server/document.server"
import { getChatWithDocument, type ChatWithDocumentResponse } from "~/server/chat.server"
import { useAppSession } from "~/utils/session"

export interface UseDocumentState {
  data: ExerciseOutput | CourseOutput | null
  loading: boolean
  error: Error | null
}

export interface UseChatWithDocumentState {
  messages: ChatWithDocumentResponse["messages"]
  document: ExerciseOutput | CourseOutput | null
  documentType: "exercise" | "course" | null
  loading: boolean
  error: Error | null
}

export interface UseDocumentOptions {
  autoFetch?: boolean
}

/**
 * Hook pour fetcher et gérer les données d'exercices
 */
export function useExercise(
  sessionId: string | null,
  options: UseDocumentOptions = { autoFetch: true }
) {
  const [state, setState] = useState<UseDocumentState>({
    data: null,
    loading: false,
    error: null,
  })

  useEffect(() => {
    if (!options.autoFetch || !sessionId) return

    const fetchData = async () => {
      setState({ data: null, loading: true, error: null })
      try {
        console.log(`🎯 [useExercise] Fetching exercise: ${sessionId}`)
        const result = await getExercise({
          data: { session_id: sessionId },
        })

        if (!isExerciseOutput(result)) {
          throw new Error("Invalid exercise output")
        }

        console.log(`✅ [useExercise] Success`)
        setState({ data: result, loading: false, error: null })
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        console.error(`❌ [useExercise] Error:`, error)
        setState({ data: null, loading: false, error })
      }
    }

    fetchData()
  }, [sessionId, options.autoFetch])

  return state
}

/**
 * Hook pour fetcher et gérer les données de cours
 */
export function useCourse(
  sessionId: string | null,
  options: UseDocumentOptions = { autoFetch: true }
) {
  const [state, setState] = useState<UseDocumentState>({
    data: null,
    loading: false,
    error: null,
  })

  useEffect(() => {
    if (!options.autoFetch || !sessionId) return

    const fetchData = async () => {
      setState({ data: null, loading: true, error: null })
      try {
        console.log(`🎯 [useCourse] Fetching course: ${sessionId}`)
        const result = await getCourse({
          data: { session_id: sessionId },
        })

        if (!isCourseOutput(result)) {
          throw new Error("Invalid course output")
        }

        console.log(`✅ [useCourse] Success`)
        setState({ data: result, loading: false, error: null })
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        console.error(`❌ [useCourse] Error:`, error)
        setState({ data: null, loading: false, error })
      }
    }

    fetchData()
  }, [sessionId, options.autoFetch])

  return state
}

/**
 * Hook générique pour fetcher un document (exercice ou cours)
 */
export function useDocument(
  sessionId: string | null,
  type: "exercise" | "course" | null,
  options: UseDocumentOptions = { autoFetch: true }
) {
  const [state, setState] = useState<UseDocumentState>({
    data: null,
    loading: false,
    error: null,
  })

  useEffect(() => {
    if (!options.autoFetch || !sessionId || !type) return

    const fetchData = async () => {
      setState({ data: null, loading: true, error: null })
      try {
        console.log(`🎯 [useDocument] Fetching ${type}: ${sessionId}`)
        const result = await getDocument({
          data: { session_id: sessionId, type },
        })

        console.log(`✅ [useDocument] Success`)
        setState({ data: result, loading: false, error: null })
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        console.error(`❌ [useDocument] Error:`, error)
        setState({ data: null, loading: false, error })
      }
    }

    fetchData()
  }, [sessionId, type, options.autoFetch])

  return state
}

/**
 * Hook pour fetcher et gérer les données de chat + document combinées
 * Idéal pour afficher un document à gauche et le chat à droite
 * car doc_id === session_id dans la DB
 */
export function useChatWithDocument(
  sessionId: string | null,
  documentType: "exercise" | "course" | null,
  options: UseDocumentOptions = { autoFetch: true }
) {
  const [state, setState] = useState<UseChatWithDocumentState>({
    messages: [],
    document: null,
    documentType: null,
    loading: false,
    error: null,
  })

  useEffect(() => {
    if (!options.autoFetch || !sessionId) return

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        // ✅ UN SEUL APPEL: getChatWithDocument() qui fait tout
        const result = await getChatWithDocument({
          data: {
            user_id: "user-id", // à adapter
            session_id: sessionId,
            doc_type: documentType || undefined,
          },
        })

        setState({
          messages: result.messages || [],
          document: result.document,
          documentType: result.documentType,
          loading: false,
          error: null,
        })
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setState(prev => ({
          ...prev,
          loading: false,
          error,
        }))
      }
    }

    fetchData()
  }, [sessionId, documentType, options.autoFetch])

  return state
}
