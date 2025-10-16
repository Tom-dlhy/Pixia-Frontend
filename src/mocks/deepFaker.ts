import { faker } from "@faker-js/faker"
import { DeepCourseHydrated, DeepCourseChapterHydrated, DeepCourseRecord, DeepCourseChapterRecord, ExerciseWithItems, Evaluation, ID } from "~/models"
import { hydrateDeepCourse, hydrateDeepCourseChapter } from "~/models/Deep"
import { randomId } from "./utils"
import { seedFaker } from "./exerciseFaker"
import { createFakeExercise } from "./exerciseFaker"
import { createFakeEvaluation } from "./evaluationFaker"

export function createFakeChapterHydrated(courseId: ID): DeepCourseChapterHydrated {
  const exercise = createFakeExercise()
  const evaluation = createFakeEvaluation(exercise.id)
  const now = Date.now()
  return {
    id: randomId(),
    title: faker.lorem.words({ min: 2, max: 5 }),
    illustrationBase64: undefined,
    courseId,
    exerciseId: exercise.id,
    evaluationId: evaluation.id,
    isCompleted: faker.datatype.boolean(),
    createdAt: now,
    updatedAt: now,
    exercise,
    evaluation,
  }
}

export function createFakeDeepCourseHydrated(chapterCount = 3, seed?: number): DeepCourseHydrated {
  seedFaker(seed)
  const courseId = randomId()
  const chapters = Array.from({ length: chapterCount }, () => createFakeChapterHydrated(courseId))
  const now = Date.now()
  return {
    id: courseId,
    title: faker.company.catchPhrase(),
    description: faker.lorem.paragraph(),
    chapters,
    isCompleted: chapters.every((c) => c.isCompleted),
    createdAt: now,
    updatedAt: now,
  }
}

export function createFakeDeepCourseNormalized(chapterCount = 3, seed?: number): {
  record: DeepCourseRecord
  chapterRecords: DeepCourseChapterRecord[]
  exercisesById: Record<ID, ExerciseWithItems>
  evaluationsById: Record<ID, Evaluation>
  hydrated: DeepCourseHydrated
} {
  seedFaker(seed)
  const courseId = randomId()
  const now = Date.now()

  const exercisesById: Record<ID, ExerciseWithItems> = {}
  const evaluationsById: Record<ID, Evaluation> = {}
  const chapterRecords: DeepCourseChapterRecord[] = []

  for (let i = 0; i < chapterCount; i++) {
    const exercise = createFakeExercise()
    const evaluation = createFakeEvaluation(exercise.id)
    exercisesById[exercise.id] = exercise
    evaluationsById[evaluation.id] = evaluation

    chapterRecords.push({
      id: randomId(),
      title: faker.lorem.words({ min: 2, max: 5 }),
      illustrationBase64: undefined,
      courseId,
      exerciseId: exercise.id,
      evaluationId: evaluation.id,
      isCompleted: faker.datatype.boolean(),
      createdAt: now,
      updatedAt: now,
    })
  }

  const record: DeepCourseRecord = {
    id: courseId,
    title: faker.company.catchPhrase(),
    description: faker.lorem.paragraph(),
    chapterIds: chapterRecords.map((c) => c.id),
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  }

  const chaptersHydrated = chapterRecords.map((ch) => hydrateDeepCourseChapter(ch, exercisesById, evaluationsById))
  const hydrated = hydrateDeepCourse(record, Object.fromEntries(chaptersHydrated.map((c) => [c.id, c])))

  return { record, chapterRecords, exercisesById, evaluationsById, hydrated }
}
