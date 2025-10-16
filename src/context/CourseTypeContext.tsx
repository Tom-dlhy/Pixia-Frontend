"use client"

import * as React from "react"
import { getCourseAccent } from "~/utils/courseTypeStyles"

export type CourseType = 'exercice' | 'cours' | 'discuss' | 'deep' | 'none'

interface CourseTypeCtx {
  courseType: CourseType
  setCourseType: (t: CourseType) => void
}

const CourseTypeContext = React.createContext<CourseTypeCtx | undefined>(undefined)

const STORAGE_KEY = "course-type"

function readStoredCourseType(): CourseType {
  if (typeof window === "undefined") return "none"
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === "exercice" || stored === "cours" || stored === "discuss" || stored === "deep" || stored === "none") {
    return stored
  }
  return "none"
}

export function CourseTypeProvider({ children }: { children: React.ReactNode }) {
  const [courseType, setCourseType] = React.useState<CourseType>(() => readStoredCourseType())

  React.useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEY, courseType)
  }, [courseType])

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return
      const next = readStoredCourseType()
      setCourseType((prev) => (prev === next ? prev : next))
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const value = React.useMemo(() => ({ courseType, setCourseType }), [courseType])
  React.useEffect(() => {
    if (typeof document === 'undefined') return
    const accent = getCourseAccent(courseType)
    const root = document.documentElement
    root.style.setProperty('--neon-gradient', accent.gradient)
    root.style.setProperty('--neon-glow', accent.glow)
    root.style.setProperty('--course-accent', accent.accent)
    root.style.setProperty('--course-accent-muted', accent.accentMuted)
  }, [courseType])
  return (
    <CourseTypeContext.Provider value={value}>{children}</CourseTypeContext.Provider>
  )
}

export function useCourseType() {
  const ctx = React.useContext(CourseTypeContext)
  if (!ctx) throw new Error('useCourseType must be used within CourseTypeProvider')
  return ctx
}
