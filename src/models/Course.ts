import { BaseEntity, ID, hydrateByIds } from "./GlobalType"

export type CourseType = "none" | "cours" | "exercice" | "deep"


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

export interface Course extends BaseEntity {
  title: string
  chapters: Chapter[]
  type?: CourseType
}

export interface CourseRecord extends BaseEntity {
  title: string
  chapterIds: ID[] 
  type?: CourseType
}

export interface CourseWithChapters extends Omit<CourseRecord, "chapterIds"> {
  chapters: Chapter[]
}

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
