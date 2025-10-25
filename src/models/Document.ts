

export interface QCMAnswer {
  id?: string
  text: string
  is_correct: boolean
  is_selected?: boolean
}

export interface QCMQuestion {
  id?: string
  question: string
  answers: QCMAnswer[]
  explanation: string
  multi_answers: boolean
  is_corrected?: boolean
}

export interface QCM {
  id?: string
  type: "qcm"
  topic: string
  questions: QCMQuestion[]
}

export interface OpenQuestion {
  id?: string
  question: string
  answers?: string
  is_correct?: boolean
  is_corrected?: boolean
  explanation: string
}

export interface Open {
  id?: string
  type: "open"
  topic: string
  questions: OpenQuestion[]
}

export type ExerciseBlock = QCM | Open

export interface ExerciseOutput {
  id?: string
  title?: string
  exercises: ExerciseBlock[]
}

export interface ChaptersPlanItem {
  title: string
  content: string
}

export interface CoursePlan {
  title: string
  chapters: ChaptersPlanItem[]
}

export interface Chapter {
  id_chapter?: string
  id_schema?: string
  title: string
  content: string
  schema_description?: string
  diagram_type?: string
  diagram_code?: string
  img_base64?: string
}

export interface CourseOutput {
  id?: string
  title: string
  chapters?: Chapter[]
  parts?: Chapter[]
}

export interface FetchDocumentResponse {
  success: boolean
  data?: ExerciseOutput | CourseOutput
  error?: string
}

export function isQCM(block: ExerciseBlock): block is QCM {
  return block.type === "qcm"
}

export function isOpen(block: ExerciseBlock): block is Open {
  return block.type === "open"
}

export function isExerciseOutput(data: unknown): data is ExerciseOutput {
  const obj = data as any
  return (
    obj &&
    typeof obj === "object" &&
    "exercises" in obj &&
    Array.isArray(obj.exercises) &&
    (obj.exercises.length === 0 ||
      (obj.exercises[0].type === "qcm" || obj.exercises[0].type === "open"))
  )
}

export function isCourseOutput(data: unknown): data is CourseOutput {
  const obj = data as any
  return (
    obj &&
    typeof obj === "object" &&
    ("chapters" in obj || "parts" in obj) &&
    "title" in obj &&
    typeof obj.title === "string"
  )
}
