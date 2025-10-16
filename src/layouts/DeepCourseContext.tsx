import { createContext, useContext, Dispatch, SetStateAction } from "react"

export type DeepCoursesTab = "cours" | "exercice" | "evaluation"

export interface DeepCoursesLayoutContextValue {
  depth: number
  activeTab: DeepCoursesTab
  setActiveTab: Dispatch<SetStateAction<DeepCoursesTab>>
  courseId?: string
  chapterId?: string
}

export const DeepCoursesLayoutContext =
  createContext<DeepCoursesLayoutContextValue | undefined>(undefined)

export function useDeepCoursesLayout() {
  const context = useContext(DeepCoursesLayoutContext)
  if (!context)
    throw new Error("useDeepCoursesLayout must be used within provider")
  return context
}
