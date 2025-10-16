export type ID = string

export type Timestamp = number

export interface BaseEntity {
  id: ID
  createdAt?: Timestamp
  updatedAt?: Timestamp
  deletedAt?: Timestamp
}

export function hydrateByIds<T>(
  ids: ReadonlyArray<ID>,
  entitiesById: Record<ID, T>,
): T[] {
  return ids
    .map((id) => {
      const entity = entitiesById[id]
      if (!entity) {
        console.warn(`hydrateByIds: missing entity for id "${id}"`)
      }
      return entity
    })
    .filter((entity): entity is T => Boolean(entity))
}
