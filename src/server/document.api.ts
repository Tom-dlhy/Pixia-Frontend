import { ExerciseOutput, CourseOutput } from "~/models/Document"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

/**
 * Classe pour gérer les erreurs API
 */
export class DocumentFetchError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message)
    this.name = "DocumentFetchError"
  }
}

/**
 * Fetch un exercice par son ID
 * @param sessionId - L'ID de la session/exercice
 * @returns Les données d'exercice
 */
export async function fetchExercise(sessionId: string): Promise<ExerciseOutput> {
  if (!sessionId) {
    throw new DocumentFetchError("sessionId is required")
  }

  try {
    console.group(`%c🌐 [API] fetchExercise Request`, 'color: #6366f1; font-weight: bold; font-size: 12px;')
    console.log(`📍 Endpoint: ${API_BASE_URL}/api/testfetchexercise`)
    console.log(`📦 Payload: { session_id: "${sessionId}" }`)
    console.groupEnd()

    const response = await fetch(`${API_BASE_URL}/api/testfetchexercise`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        session_id: sessionId,
      }).toString(),
    })

    console.group(`%c📨 [API] fetchExercise Response Status`, 'color: #06b6d4; font-weight: bold; font-size: 12px;')
    console.log(`✓ Status: ${response.status} ${response.statusText}`)
    console.log(`✓ OK: ${response.ok}`)
    console.groupEnd()

    if (!response.ok) {
      throw new DocumentFetchError(
        `Failed to fetch exercise: ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json()
    console.group(`%c✅ [API] fetchExercise Response Data`, 'color: #10b981; font-weight: bold; font-size: 12px;')
    console.log(`📦 Type: ${typeof data}`)
    console.log(`📦 Keys: ${Object.keys(data || {})}`)
    console.log(`📄 Data:`, data)
    console.groupEnd()
    
    return data as ExerciseOutput
  } catch (error) {
    console.group(`%c❌ [API] fetchExercise Error`, 'color: #ef4444; font-weight: bold; font-size: 12px;')
    console.log(`Error: ${error instanceof Error ? error.message : String(error)}`)
    console.log(`Full error:`, error)
    console.groupEnd()
    throw new DocumentFetchError(
      "Failed to fetch exercise",
      undefined,
      error
    )
  }
}

/**
 * Fetch un cours par son ID
 * @param sessionId - L'ID de la session/cours
 * @returns Les données du cours
 */
export async function fetchCourse(sessionId: string): Promise<CourseOutput> {
  if (!sessionId) {
    throw new DocumentFetchError("sessionId is required")
  }

  try {
    console.group(`%c🌐 [API] fetchCourse Request`, 'color: #6366f1; font-weight: bold; font-size: 12px;')
    console.log(`📍 Endpoint: ${API_BASE_URL}/api/testfetchcourse`)
    console.log(`📦 Payload: { session_id: "${sessionId}" }`)
    console.groupEnd()

    const response = await fetch(`${API_BASE_URL}/api/testfetchcourse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        session_id: sessionId,
      }).toString(),
    })

    console.group(`%c📨 [API] fetchCourse Response Status`, 'color: #06b6d4; font-weight: bold; font-size: 12px;')
    console.log(`✓ Status: ${response.status} ${response.statusText}`)
    console.log(`✓ OK: ${response.ok}`)
    console.groupEnd()

    if (!response.ok) {
      throw new DocumentFetchError(
        `Failed to fetch course: ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json()
    console.group(`%c✅ [API] fetchCourse Response Data`, 'color: #10b981; font-weight: bold; font-size: 12px;')
    console.log(`📦 Type: ${typeof data}`)
    console.log(`📦 Keys: ${Object.keys(data || {})}`)
    console.log(`📄 Data:`, data)
    console.groupEnd()
    
    return data as CourseOutput
  } catch (error) {
    console.group(`%c❌ [API] fetchCourse Error`, 'color: #ef4444; font-weight: bold; font-size: 12px;')
    console.log(`Error: ${error instanceof Error ? error.message : String(error)}`)
    console.log(`Full error:`, error)
    console.groupEnd()
    throw new DocumentFetchError(
      "Failed to fetch course",
      undefined,
      error
    )
  }
}

/**
 * Fetch un document (exercice ou cours) par type
 * @param sessionId - L'ID de la session
 * @param type - Le type de document: "exercise" ou "course"
 * @returns Les données du document
 */
export async function fetchDocument(
  sessionId: string,
  type: "exercise" | "course"
): Promise<ExerciseOutput | CourseOutput> {
  if (type === "exercise") {
    return fetchExercise(sessionId)
  } else if (type === "course") {
    return fetchCourse(sessionId)
  } else {
    throw new DocumentFetchError(`Unknown document type: ${type}`)
  }
}

/**
 * Fetch un document avec retry automatique
 * @param sessionId - L'ID de la session
 * @param type - Le type de document: "exercise" ou "course"
 * @param maxRetries - Nombre maximum de tentatives
 * @param delayMs - Délai entre les tentatives en ms
 * @returns Les données du document
 */
export async function fetchDocumentWithRetry(
  sessionId: string,
  type: "exercise" | "course",
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<ExerciseOutput | CourseOutput> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [fetchDocumentWithRetry] Attempt ${attempt}/${maxRetries}`)
      return await fetchDocument(sessionId, type)
    } catch (error) {
      lastError = error as Error
      console.warn(`⚠️ [fetchDocumentWithRetry] Attempt ${attempt} failed:`, error)

      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = delayMs * Math.pow(2, attempt - 1)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw new DocumentFetchError(
    `Failed to fetch document after ${maxRetries} attempts`,
    undefined,
    lastError
  )
}
