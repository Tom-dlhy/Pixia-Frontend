import { faker } from "@faker-js/faker"
import type { Chapter, ID } from "~/models"
import { randomId } from "./utils"

export function createFakeChapter(): Chapter {
  const now = Date.now()
  return {
    id: randomId(),
    title: faker.lorem.words({ min: 2, max: 5 }),
    content: faker.lorem.paragraphs({ min: 1, max: 3 }),
    schemas: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function createFakeChapters(count = 5): { list: Chapter[]; byId: Record<ID, Chapter> } {
  const list = Array.from({ length: count }, createFakeChapter)
  const byId = Object.fromEntries(list.map((c) => [c.id, c]))
  return { list, byId }
}
