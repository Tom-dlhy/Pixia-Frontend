import { BaseEntity, ID, hydrateByIds } from "./GlobalType"

export const EXERCISE_TYPES = ["qcm", "open"] as const
export type ExerciseType = (typeof EXERCISE_TYPES)[number]

export interface BaseExercise extends BaseEntity {
  topic: string
  type: ExerciseType
}

export interface MCQExercise extends BaseExercise {
  type: "qcm"
  questions: MCQQuestion[]
}

export interface MCQQuestion {
  id: ID
  question: string
  options: MCQOption[]
  explanation?: string
  multiple?: boolean
}

export interface MCQOption {
  id: ID
  text: string
  isCorrect: boolean
}

export interface OpenExercise extends BaseExercise {
  type: "open"
  questions: OpenQuestion[]
}

export interface OpenQuestion {
  id: ID
  question: string
  answer?: string
  explanation?: string
}

export type ExerciseItem = MCQExercise | OpenExercise

export interface ExerciseRecord extends BaseEntity {
  itemIds: ID[]
}

export interface ExerciseWithItems extends Omit<ExerciseRecord, "itemIds"> {
  items: ExerciseItem[]
}

export type ExerciseMap = Record<ID, ExerciseItem>

export function hydrateExercise(
  record: ExerciseRecord,
  itemsById: ExerciseMap
): ExerciseWithItems {
  return {
    ...record,
    items: hydrateByIds(record.itemIds, itemsById),
  }
}

export function dehydrateExercise(exercise: ExerciseWithItems): ExerciseRecord {
  return {
    ...exercise,
    itemIds: exercise.items.map((i) => i.id),
  }
}
