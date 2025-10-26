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


const DocumentTypeSchema = z.enum(["exercise", "course"])

const FetchDocumentPayloadSchema = z.object({
  session_id: z.string().min(1, "session_id is required"),
  type: DocumentTypeSchema,
})

type FetchDocumentPayload = z.infer<typeof FetchDocumentPayloadSchema>


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

  try {
    const exercise = await apiFetchExercise(validated.session_id)

    if (!isExerciseOutput(exercise)) {
      throw new Error("Invalid exercise output format")
    }
    
    return exercise
  } catch (error) {
    throw error
  }
}

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

  try {
    const course = await apiFetchCourse(validated.session_id)

    if (!isCourseOutput(course)) {
      throw new Error("Invalid course output format")
    }

    return course
  } catch (error) {
    throw error
  }
}

export async function getDocument(payload: {
  data: {
    session_id: string
    type: "exercise" | "course"
  }
}): Promise<ExerciseOutput | CourseOutput> {
  const validated = FetchDocumentPayloadSchema.parse(payload.data)

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
    console.error(`[getDocument] Error:`, error)
    throw error
  }
}
