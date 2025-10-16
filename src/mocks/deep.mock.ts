import { DeepCourseHydrated, DeepCourseChapterHydrated } from "~/models/Deep"
import { createMockExercise } from "./exercise.mock"
import { randomId, randomDate } from "./utils"
import { Evaluation } from "~/models/Evaluation"

export function createMockChapter(): DeepCourseChapterHydrated {
  const exercise = createMockExercise()

  // Création d'une fausse évaluation cohérente avec le type actuel
  const evaluation: Evaluation = {
    id: randomId(),
    userId: "user_001",
    exerciseId: exercise.id,
    score: Math.floor(Math.random() * 100),
    completedAt: randomDate(),
    durationMs: Math.floor(Math.random() * 600000), // jusqu’à 10 min
    createdAt: randomDate(),
    updatedAt: randomDate(),
  }

  return {
    id: randomId(),
    title: "Introduction to AI",
    courseId: "course_123",
    exerciseId: exercise.id,
    evaluationId: evaluation.id,
    isCompleted: false,
    createdAt: randomDate(),
    updatedAt: randomDate(),
    deletedAt: undefined,
    exercise,
    evaluation,
  }
}

export function createMockDeepCourse(): DeepCourseHydrated {
  const chapters = [createMockChapter(), createMockChapter()]
  return {
    id: randomId(),
    title: "Deep Learning Fundamentals",
    description: "Understand neural networks and deep models.",
    chapters,
    isCompleted: false,
    createdAt: randomDate(),
    updatedAt: randomDate(),
    deletedAt: undefined,
  }
}
