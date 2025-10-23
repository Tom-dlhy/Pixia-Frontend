"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"

interface ChapterCompleteContextType {
  isChapterComplete: boolean
  setIsChapterComplete: (value: boolean) => void
  toggleChapterComplete: () => void
}

const ChapterCompleteContext = createContext<ChapterCompleteContextType | undefined>(undefined)

export function ChapterCompleteProvider({ children }: { children: ReactNode }) {
  const [isChapterComplete, setIsChapterComplete] = useState(false)

  const toggleChapterComplete = useCallback(() => {
    setIsChapterComplete((prev) => !prev)
  }, [])

  return (
    <ChapterCompleteContext.Provider value={{ isChapterComplete, setIsChapterComplete, toggleChapterComplete }}>
      {children}
    </ChapterCompleteContext.Provider>
  )
}

export function useChapterComplete() {
  const context = useContext(ChapterCompleteContext)
  if (!context) {
    throw new Error("useChapterComplete must be used within ChapterCompleteProvider")
  }
  return context
}
