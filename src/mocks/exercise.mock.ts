import { ExerciseWithItems, MCQExercise, MCQQuestion, MCQOption } from "~/models"
import { randomId, randomDate } from "./utils"

export function createMockMCQExercise(): MCQExercise {
  const options: MCQOption[] = [
    { id: randomId(), text: "Option A", isCorrect: false },
    { id: randomId(), text: "Option B", isCorrect: true },
    { id: randomId(), text: "Option C", isCorrect: false },
  ]

  const questions: MCQQuestion[] = [
    {
      id: randomId(),
      question: "What is TypeScript?",
      options,
      explanation: "A typed superset of JavaScript.",
    },
  ]

  return {
    id: randomId(),
    topic: "Programming",
    type: "qcm",
    createdAt: randomDate(),
    questions,
  }
}

export function createMockExercise(): ExerciseWithItems {
  return {
    id: randomId(),
    createdAt: randomDate(),
    updatedAt: randomDate(),
    items: [createMockMCQExercise()],
  }
}
