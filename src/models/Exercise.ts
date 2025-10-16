import { BaseEntity, ID, hydrateByIds } from "./GlobalType"

// ----------------------------------------------
// Enum-like type for exercise categories
// ----------------------------------------------
export const EXERCISE_TYPES = ["qcm", "open"] as const
export type ExerciseType = (typeof EXERCISE_TYPES)[number]

// ----------------------------------------------
// Base model (common fields)
// ----------------------------------------------
export interface BaseExercise extends BaseEntity {
  topic: string
  type: ExerciseType
}

// ----------------------------------------------
// MCQ (Multiple Choice Questions) model
// ----------------------------------------------
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

// ----------------------------------------------
// Open (free-answer) exercise model
// ----------------------------------------------
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

// ----------------------------------------------
// Discriminated union for all exercise variants
// ----------------------------------------------
export type ExerciseItem = MCQExercise | OpenExercise

// ----------------------------------------------
// Canonical storage format (lightweight, for DB or API)
// ----------------------------------------------
export interface ExerciseRecord extends BaseEntity {
  itemIds: ID[]
}

// ----------------------------------------------
// Hydrated format (used in UI or state management)
// ----------------------------------------------
export interface ExerciseWithItems extends Omit<ExerciseRecord, "itemIds"> {
  items: ExerciseItem[]
}

// ----------------------------------------------
// Map and transformation utilities
// ----------------------------------------------
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
