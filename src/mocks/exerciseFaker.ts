import { faker } from "@faker-js/faker"
import type { ExerciseWithItems, ID } from "~/models"
import { randomId } from "./utils"

export function seedFaker(seed?: number) {
  if (typeof seed === "number") faker.seed(seed)
}

function ensureAtLeastOneCorrect(options: { id: ID; text: string; isCorrect: boolean }[]) {
  if (!options.some((o) => o.isCorrect)) {
    options[faker.number.int({ min: 0, max: options.length - 1 })].isCorrect = true
  }
  return options
}

export function createFakeExercise(): ExerciseWithItems {
  const questionCount = faker.number.int({ min: 2, max: 5 })
  const questions = Array.from({ length: questionCount }).map(() => {
    const options = ensureAtLeastOneCorrect(
      Array.from({ length: 4 }).map(() => ({
        id: randomId(),
        text: faker.lorem.words({ min: 1, max: 3 }),
        isCorrect: faker.datatype.boolean(),
      })),
    )
    return {
      id: randomId(),
      question: faker.lorem.sentence(),
      options,
      explanation: faker.lorem.sentence(),
      multiple: faker.datatype.boolean(),
    }
  })

  const now = Date.now()
  return {
    id: randomId(),
    createdAt: now,
    updatedAt: now,
    items: [
      {
        id: randomId(),
        type: "qcm",
        topic: faker.word.noun(),
        questions,
        createdAt: now,
        updatedAt: now,
      },
    ],
  }
}

export function createFakeExercises(count = 5): { list: ExerciseWithItems[]; byId: Record<ID, ExerciseWithItems> } {
  const list = Array.from({ length: count }, createFakeExercise)
  const byId = Object.fromEntries(list.map((e) => [e.id, e]))
  return { list, byId }
}
