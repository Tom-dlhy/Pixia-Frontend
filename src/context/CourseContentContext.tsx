import { createContext, useContext, useState, ReactNode } from 'react'
import { CourseWithChapters, Chapter } from '~/models/Course'

interface CourseContentContextType {
  course: CourseWithChapters | null
  setCourse: (course: CourseWithChapters | null) => void
}

const CourseContentContext = createContext<CourseContentContextType | undefined>(undefined)

export function CourseContentProvider({ children }: { children: ReactNode }) {
  const [course, setCourse] = useState<CourseWithChapters | null>(null)

  return (
    <CourseContentContext.Provider value={{ course, setCourse }}>
      {children}
    </CourseContentContext.Provider>
  )
}

export function useCourseContent() {
  const context = useContext(CourseContentContext)
  if (!context) {
    throw new Error('useCourseContent must be used within CourseContentProvider')
  }
  return context
}
