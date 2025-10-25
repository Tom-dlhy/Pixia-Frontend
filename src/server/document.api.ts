import { ExerciseOutput, CourseOutput } from "~/models/Document"

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api"

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

export async function fetchExercise(sessionId: string): Promise<ExerciseOutput> {
  if (!sessionId) {
    throw new DocumentFetchError("sessionId is required")
  }

  try {
    console.groupEnd()

    const response = await fetch(`${API_BASE}/fetchexercise`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        session_id: sessionId,
      }).toString(),
    })

    if (!response.ok) {
      throw new DocumentFetchError(
        `Failed to fetch exercise: ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json()
    
    return data as ExerciseOutput
  } catch (error) {
    throw new DocumentFetchError(
      "Failed to fetch exercise",
      undefined,
      error
    )
  }
}

export async function fetchCourse(sessionId: string): Promise<CourseOutput> {
  if (!sessionId) {
    throw new DocumentFetchError("sessionId is required")
  }

  try {

    const response = await fetch(`${API_BASE}/fetchcourse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        session_id: sessionId,
      }).toString(),
    })

    if (!response.ok) {
      throw new DocumentFetchError(
        `Failed to fetch course: ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json()
    
    return data as CourseOutput
  } catch (error) {
    throw new DocumentFetchError(
      "Failed to fetch course",
      undefined,
      error
    )
  }
}

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

export async function fetchDocumentWithRetry(
  sessionId: string,
  type: "exercise" | "course",
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<ExerciseOutput | CourseOutput> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchDocument(sessionId, type)
    } catch (error) {
      lastError = error as Error
      console.warn(`[fetchDocumentWithRetry] Attempt ${attempt} failed:`, error)

      if (attempt < maxRetries) {
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


