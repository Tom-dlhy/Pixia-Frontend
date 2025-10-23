"use server"

import { z } from "zod"
import {
  ExerciseOutput,
  CourseOutput,
  isExerciseOutput,
  isCourseOutput,
} from "~/models/Document"
import {
  fetchExercise as apiFetchExercise,
  fetchCourse as apiFetchCourse,
  DocumentFetchError,
} from "~/server/document.api"

// ==================== ZOOD SCHEMAS ====================

const DocumentTypeSchema = z.enum(["exercise", "course"])

const FetchDocumentPayloadSchema = z.object({
  session_id: z.string().min(1, "session_id is required"),
  type: DocumentTypeSchema,
})

type FetchDocumentPayload = z.infer<typeof FetchDocumentPayloadSchema>

// ==================== SERVER FUNCTIONS ====================

/**
 * Server function pour fetcher un exercice avec validation Zod
 */
export async function getExercise(payload: {
  data: {
    session_id: string
  }
}): Promise<ExerciseOutput> {
  const validated = z
    .object({
      session_id: z.string().min(1),
    })
    .parse(payload.data)

  console.group(`%c� [SERVER] getExercise Input`, 'color: #f59e0b; font-weight: bold; font-size: 13px;')
  console.log(`📍 session_id: ${validated.session_id}`)
  console.groupEnd()

  try {
    console.log(`🔄 Calling apiFetchExercise(${validated.session_id})...`)
    const exercise = await apiFetchExercise(validated.session_id)

    console.group(`%c🔍 [SERVER] getExercise API Response`, 'color: #8b5cf6; font-weight: bold; font-size: 13px;')
    console.log(`📦 Response type: ${typeof exercise}`)
    console.log(`📦 Keys: ${exercise ? Object.keys(exercise) : 'null'}`)
    console.log(`📦 isExerciseOutput check: ${isExerciseOutput(exercise)}`)
    console.log(`📄 Full response:`, exercise)
    console.groupEnd()

    if (!isExerciseOutput(exercise)) {
      throw new Error("Invalid exercise output format")
    }

    console.group(`%c✅ [SERVER] getExercise Output`, 'color: #10b981; font-weight: bold; font-size: 13px;')
    console.log(`✓ Exercise is valid ExerciseOutput`)
    console.log(`✓ Exercises count: ${exercise.exercises?.length || 0}`)
    console.groupEnd()
    
    return exercise
  } catch (error) {
    console.group(`%c❌ [SERVER] getExercise Error`, 'color: #ef4444; font-weight: bold; font-size: 13px;')
    console.log(`Error: ${error instanceof Error ? error.message : String(error)}`)
    console.log(`Full error:`, error)
    console.groupEnd()
    throw error
  }
}

/**
 * Server function pour fetcher un cours avec validation Zod
 */
export async function getCourse(payload: {
  data: {
    session_id: string
  }
}): Promise<CourseOutput> {
  const validated = z
    .object({
      session_id: z.string().min(1),
    })
    .parse(payload.data)

  console.group(`%c� [SERVER] getCourse Input`, 'color: #f59e0b; font-weight: bold; font-size: 13px;')
  console.log(`📍 session_id: ${validated.session_id}`)
  console.groupEnd()

  try {
    console.log(`🔄 Calling apiFetchCourse(${validated.session_id})...`)
    const course = await apiFetchCourse(validated.session_id)

    console.group(`%c🔍 [SERVER] getCourse API Response`, 'color: #8b5cf6; font-weight: bold; font-size: 13px;')
    console.log(`📦 Response type: ${typeof course}`)
    console.log(`📦 Keys: ${course ? Object.keys(course) : 'null'}`)
    console.log(`📦 isCourseOutput check: ${isCourseOutput(course)}`)
    console.groupEnd()

    if (!isCourseOutput(course)) {
      throw new Error("Invalid course output format")
    }

    console.group(`%c✅ [SERVER] getCourse Output`, 'color: #10b981; font-weight: bold; font-size: 13px;')
    console.log(`✓ Course is valid CourseOutput`)
    console.log(`✓ Title: ${course.title}`)
    console.log(`✓ Chapters count: ${course.chapters?.length || 0}`)
    console.groupEnd()
    
    return course
  } catch (error) {
    console.group(`%c❌ [SERVER] getCourse Error`, 'color: #ef4444; font-weight: bold; font-size: 13px;')
    console.log(`Error: ${error instanceof Error ? error.message : String(error)}`)
    console.log(`Full error:`, error)
    console.groupEnd()
    throw error
  }
}

/**
 * Server function générique pour fetcher un document (exercice ou cours)
 */
export async function getDocument(payload: {
  data: {
    session_id: string
    type: "exercise" | "course"
  }
}): Promise<ExerciseOutput | CourseOutput> {
  const validated = FetchDocumentPayloadSchema.parse(payload.data)

  console.log(`📝 [getDocument] Server function called with:`, validated)

  try {
    if (validated.type === "exercise") {
      return await getExercise({
        data: { session_id: validated.session_id },
      })
    } else {
      return await getCourse({
        data: { session_id: validated.session_id },
      })
    }
  } catch (error) {
    console.error(`❌ [getDocument] Error:`, error)
    throw error
  }
}
