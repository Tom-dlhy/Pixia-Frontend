import { BaseEntity, ID, hydrateByIds } from "./GlobalType"
import { ExerciseWithItems as Exercise } from "./Exercise"
import { Evaluation } from "./Evaluation"

// ----------------------------------------------
// Core models
// ----------------------------------------------

/**
 * Represents a Deep Learning–style course composed of multiple chapters,
 * each potentially linked to an exercise or evaluation.
 */
export interface DeepCourse extends BaseEntity {
  title: string
  description: string
  chapters: DeepCourseChapterHydrated[]
  isCompleted: boolean
}

/**
 * Represents a single chapter in a DeepCourse.
 * It references the linked course, exercise, and evaluation by ID.
 */
export interface DeepCourseChapter extends BaseEntity {
  title: string
  illustrationBase64?: string
  courseId: ID
  exerciseId: ID
  evaluationId: ID
  isCompleted: boolean
}

// ----------------------------------------------
// Canonical (storage) version
// ----------------------------------------------

/**
 * Lightweight version of DeepCourse used for persistence or API transfer.
 * Stores chapter references as IDs only.
 */
export interface DeepCourseRecord extends BaseEntity {
  title: string
  description: string
  chapterIds: ID[]
  isCompleted: boolean
}

/**
 * Canonical version of a chapter, referencing linked entities by ID only.
 */
export interface DeepCourseChapterRecord extends DeepCourseChapter {}

// ----------------------------------------------
// Hydrated (UI/state) versions
// ----------------------------------------------

/**
 * Hydrated version of a chapter including full Exercise/Evaluation objects.
 */
export interface DeepCourseChapterHydrated
  extends DeepCourseChapterRecord {
  exercise?: Exercise
  evaluation?: Evaluation
}

/**
 * Hydrated version of a DeepCourse with complete chapters.
 */
export interface DeepCourseHydrated
  extends Omit<DeepCourseRecord, "chapterIds"> {
  chapters: DeepCourseChapterHydrated[]
}

// ----------------------------------------------
// Utility maps and transformations
// ----------------------------------------------
export type DeepCourseChapterMap = Record<ID, DeepCourseChapterHydrated>
export type DeepExerciseMap = Record<ID, Exercise>
export type DeepEvaluationMap = Record<ID, Evaluation>


/**
 * Hydrates a DeepCourse from its canonical record and related maps.
 */
export function hydrateDeepCourse(
  record: DeepCourseRecord,
  chaptersById: DeepCourseChapterMap,
): DeepCourseHydrated {
  const chapters = hydrateByIds(record.chapterIds, chaptersById)
  return { ...record, chapters }
}

/**
 * Dehydrates a DeepCourseHydrated back to its canonical form.
 */
export function dehydrateDeepCourse(
  course: DeepCourseHydrated,
): DeepCourseRecord {
  return {
    ...course,
    chapterIds: course.chapters.map((chapter) => chapter.id),
  }
}

/**
 * Hydrates a DeepCourseChapter by linking its Exercise and Evaluation.
 */
export function hydrateDeepCourseChapter(
  chapter: DeepCourseChapterRecord,
  exercisesById: DeepExerciseMap,
  evaluationsById: DeepEvaluationMap,
): DeepCourseChapterHydrated {
  const exercise = exercisesById[chapter.exerciseId]
  const evaluation = evaluationsById[chapter.evaluationId]

  if (!exercise) {
    console.warn(
      `Exercise ${chapter.exerciseId} not found during chapter hydration.`,
    )
  }

  if (!evaluation) {
    console.warn(
      `Evaluation ${chapter.evaluationId} not found during chapter hydration.`,
    )
  }

  return { ...chapter, exercise, evaluation }
}

/**
 * Dehydrates a hydrated chapter back into its canonical record.
 */
export function dehydrateDeepCourseChapter(
  chapter: DeepCourseChapterHydrated,
): DeepCourseChapterRecord {
  return {
    id: chapter.id,
    title: chapter.title,
    illustrationBase64: chapter.illustrationBase64,
    courseId: chapter.courseId,
    exerciseId: chapter.exercise?.id ?? chapter.exerciseId,
    evaluationId: chapter.evaluation?.id ?? chapter.evaluationId,
    isCompleted: chapter.isCompleted,
    createdAt: chapter.createdAt,
    updatedAt: chapter.updatedAt,
    deletedAt: chapter.deletedAt,
  }
}

// ----------------------------------------------
// Domain helpers
// ----------------------------------------------

/**
 * Returns true if all chapters of a DeepCourse are completed.
 */
export function isDeepCourseCompleted(course: DeepCourseHydrated): boolean {
  return course.chapters.every((chapter) => chapter.isCompleted)
}

/**
 * Returns the completion rate of a DeepCourse (0–1).
 */
export function getDeepCourseProgress(course: DeepCourseHydrated): number {
  const total = course.chapters.length
  if (total === 0) return 0
  const completed = course.chapters.filter((chapter) => chapter.isCompleted).length
  return completed / total
}

/**
 * Serialize a DeepCourseRecord for local storage or network transport.
 */
export function serializeDeepCourse(course: DeepCourseRecord): string {
  return JSON.stringify(course)
}

/**
 * Deserialize a DeepCourseRecord from JSON.
 */
export function deserializeDeepCourse(json: string): DeepCourseRecord {
  return JSON.parse(json) as DeepCourseRecord
}
