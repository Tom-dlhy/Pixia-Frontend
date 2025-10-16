import { BaseEntity, ID, Timestamp } from "./GlobalType"

export interface Evaluation extends BaseEntity {
  userId: ID
  exerciseId: ID
  score?: number
  completedAt?: Timestamp
  durationMs?: number
}