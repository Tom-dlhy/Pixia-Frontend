import { BaseEntity, ID, hydrateByIds } from "./GlobalType"
import { ExerciseWithItems as Exercise } from "./Exercise"
import { Evaluation } from "./Evaluation"

export interface DeepCourse extends BaseEntity {
  title: string
  description: string
  chapters: DeepCourseChapterHydrated[]
  isCompleted: boolean
}

export interface DeepCourseChapter extends BaseEntity {
  title: string
  illustrationBase64?: string
  courseId: ID
  exerciseId: ID
  evaluationId: ID
  isCompleted: boolean
}

export interface DeepCourseRecord extends BaseEntity {
  title: string
  description: string
  chapterIds: ID[]
  isCompleted: boolean
}

export interface DeepCourseChapterRecord extends DeepCourseChapter {}

export interface DeepCourseChapterHydrated
  extends DeepCourseChapterRecord {
  exercise?: Exercise
  evaluation?: Evaluation
}

export interface DeepCourseHydrated
  extends Omit<DeepCourseRecord, "chapterIds"> {
  chapters: DeepCourseChapterHydrated[]
}

export type DeepCourseChapterMap = Record<ID, DeepCourseChapterHydrated>
export type DeepExerciseMap = Record<ID, Exercise>
export type DeepEvaluationMap = Record<ID, Evaluation>


export function hydrateDeepCourse(
  record: DeepCourseRecord,
  chaptersById: DeepCourseChapterMap,
): DeepCourseHydrated {
  const chapters = hydrateByIds(record.chapterIds, chaptersById)
  return { ...record, chapters }
}

export function dehydrateDeepCourse(
  course: DeepCourseHydrated,
): DeepCourseRecord {
  return {
    ...course,
    chapterIds: course.chapters.map((chapter) => chapter.id),
  }
}

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

export function isDeepCourseCompleted(course: DeepCourseHydrated): boolean {
  return course.chapters.every((chapter) => chapter.isCompleted)
}

export function getDeepCourseProgress(course: DeepCourseHydrated): number {
  const total = course.chapters.length
  if (total === 0) return 0
  const completed = course.chapters.filter((chapter) => chapter.isCompleted).length
  return completed / total
}

export function serializeDeepCourse(course: DeepCourseRecord): string {
  return JSON.stringify(course)
}

export function deserializeDeepCourse(json: string): DeepCourseRecord {
  return JSON.parse(json) as DeepCourseRecord
}
