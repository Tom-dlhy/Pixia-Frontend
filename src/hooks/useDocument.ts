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
  docType?: "exercise" | "course",
  options: UseDocumentOptions = { autoFetch: true }
) {
  const { session } = useAppSession()
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
      const userId = session.userId != null ? String(session.userId) : "anonymous-user"
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const result = await getChatWithDocument({
          data: {
            user_id: userId,
            session_id: sessionId,
            doc_type: docType,
          },
        })

        const docTitle = (result.document as any)?.title || 'N/A'
        const parts = (result.document as any)?.parts || (result.document as any)?.chapters || []
        const exercises = (result.document as any)?.exercises || []
        
        // For courses: show parts titles
        if (parts.length > 0) {
          const partTitles = parts.map((p: any) => p.title).join(' | ')
          const hasSchemas = parts.some((p: any) => p.id_schema || p.schema_description)
          
          console.log(
            `%c📚 ${docTitle}%c\n   📌 ${partTitles}${hasSchemas ? '\n   📊 Schémas: ✓' : ''}`,
            'color: #10b981; font-weight: bold; font-size: 12px;',
            'color: #64748b; font-size: 11px;'
          )
        }
        
        // For exercises: show exercises count and types
        if (exercises.length > 0) {
          const qcmCount = exercises.filter((e: any) => e.type === 'qcm').length
          const openCount = exercises.filter((e: any) => e.type === 'open').length
          const totalQuestions = exercises.reduce((sum: number, e: any) => sum + (e.questions?.length || 0), 0)
          
          console.log(
            `%c✏️ Exercices%c\n   📊 ${qcmCount} QCM + ${openCount} Questions ouvertes = ${totalQuestions} questions`,
            'color: #f59e0b; font-weight: bold; font-size: 12px;',
            'color: #64748b; font-size: 11px;'
          )
        }

        setState({
          messages: result.messages,
          document: result.document,
          documentType: result.documentType,
          loading: false,
          error: null,
        })
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        console.error(
          `%c📄 [Course $${sessionId}] ❌ Error: ${error.message}`,
          'color: #ef4444; font-weight: bold; font-size: 12px;'
        )
        setState((prev) => ({
          ...prev,
          loading: false,
          error,
        }))
      }
    }

    fetchData()
  }, [sessionId, docType, options.autoFetch, session.userId])

  return state
}
