import { BaseEntity, ID, hydrateByIds } from "./GlobalType"

// ----------------------------------------------
// Enum-like type for course categories
// ----------------------------------------------
export type CourseType = "none" | "cours" | "exercice" | "discuss" | "deep"

// ----------------------------------------------
// Core models
// ----------------------------------------------
export interface Schema extends BaseEntity {
  name: string
  svgBase64: string
}

export interface Chapter extends BaseEntity {
  title: string
  content: string
  schemas?: Schema[]
  schema_description?: string
  diagram_type?: string
  diagram_code?: string
  img_base64?: string
}

// ----------------------------------------------
// Hydrated version (used in UI or state management)
// ----------------------------------------------
export interface Course extends BaseEntity {
  title: string
  chapters: Chapter[]
  type?: CourseType
}

// ----------------------------------------------
// Canonical storage format (lightweight, for DB or API)
// ----------------------------------------------
export interface CourseRecord extends BaseEntity {
  title: string
  chapterIds: ID[] // preserves order, references canonical storage
  type?: CourseType
}

// ----------------------------------------------
// Hydrated version derived from CourseRecord
// ----------------------------------------------
export interface CourseWithChapters extends Omit<CourseRecord, "chapterIds"> {
  chapters: Chapter[]
}

// ----------------------------------------------
// Utility types and transformation functions
// ----------------------------------------------
export type ChapterMap = Record<ID, Chapter>

export function hydrateCourse(
  record: CourseRecord,
  chaptersById: ChapterMap
): CourseWithChapters {
  return {
    ...record,
    chapters: hydrateByIds(record.chapterIds, chaptersById),
  }
}

export function dehydrateCourse(course: CourseWithChapters): CourseRecord {
  return {
    ...course,
    chapterIds: course.chapters.map((c) => c.id),
  }
}
