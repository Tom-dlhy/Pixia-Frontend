import { faker } from "@faker-js/faker"
import type { Evaluation, ExerciseWithItems, ID } from "~/models"
import { randomId } from "./utils"

export function createFakeEvaluation(exerciseId: ID, userId = "user_001"): Evaluation {
  const now = Date.now()
  return {
    id: randomId(),
    userId,
    exerciseId,
    score: faker.number.int({ min: 0, max: 100 }),
    completedAt: now,
    durationMs: faker.number.int({ min: 60_000, max: 600_000 }),
    createdAt: now,
    updatedAt: now,
  }
}

export function createFakeEvaluationsForExercises(
  exercisesById: Record<ID, ExerciseWithItems>,
  userId = "user_001",
): { list: Evaluation[]; byId: Record<ID, Evaluation> } {
  const list = Object.values(exercisesById).map((ex) => createFakeEvaluation(ex.id, userId))
  const byId = Object.fromEntries(list.map((e) => [e.id, e]))
  return { list, byId }
}
