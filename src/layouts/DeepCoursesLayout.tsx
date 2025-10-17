"use client"

import {
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router"
import * as React from "react"
import { useEffect, useMemo, useState } from "react"

import { useCourseType } from "~/context/CourseTypeContext"
import {
  DeepCoursesLayoutContext,
  DeepCoursesTab,
} from "~/layouts/DeepCourseContext"

import ContentContainer from "~/layouts/ContentContainer"
import CopiloteContainer from "~/layouts/CopiloteContainer"
import DeepCourseHeader from "~/layouts/DeepCourseHeader"
import DeepCourseTabs from "~/layouts/DeepCourseTabs"
import BackButton from "~/components/BackButton"
import ActionButton from "~/components/ActionButton"
import { cn } from "~/lib/utils"
import { getGradientClasses } from "~/utils/getGradientClasses"
import type { CourseType } from "~/context/CourseTypeContext"

export function DeepCoursesLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setCourseType } = useCourseType()

  const [activeTab, setActiveTab] = useState<DeepCoursesTab>("cours")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [isDark, setIsDark] = useState(
    typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")
  )

  const segments = location.pathname.split("/").filter(Boolean)
  const deepCoursesIndex = segments.indexOf("deep-courses")
  const depth = deepCoursesIndex === -1 ? 0 : segments.length - deepCoursesIndex

  const courseId = depth >= 2 ? segments[deepCoursesIndex + 1] : undefined
  const chapterId = depth >= 3 ? segments[deepCoursesIndex + 2] : undefined

  const accentCourseType: CourseType = useMemo(() => {
    if (depth === 3) {
      if (activeTab === "cours") return "cours"
      if (activeTab === "exercice") return "exercice"
    }
    return "deep"
  }, [depth, activeTab])

  useEffect(() => {
    setCourseType(accentCourseType)
  }, [accentCourseType, setCourseType])

  useEffect(() => {
    if (depth < 3) setActiveTab("cours")
  }, [depth])

  const handleNavigateBack = () => {
    if (depth <= 1) navigate({ to: "/chat" })
    else if (depth === 2) navigate({ to: "/deep-courses" })
    else if (depth === 3 && courseId)
      navigate({ to: "/deep-courses/$courseId", params: { courseId } })
  }

  const formatTitle = (prefix: string, id?: string) =>
    id?.startsWith(prefix)
      ? `${prefix[0].toUpperCase()}${prefix.slice(1)} ${id.split(`${prefix}-`)[1]}`
      : id ?? prefix

  const headerTitle = useMemo(() => {
    if (depth <= 1) return "Vos cours"
    if (depth === 2) return formatTitle("cours", courseId)
    return formatTitle("chapitre", chapterId)
  }, [depth, courseId, chapterId])

  const rightAction = useMemo(() => {
    if (depth <= 1) {
      return (
        <ActionButton
          viewLevel="root"
          onCreateCourse={() => console.info("Création d’un nouveau cours")}
        />
      )
    }

    if (depth === 2 && courseId) {
      return (
        <ActionButton
          viewLevel="course"
          onAddChapter={() => console.info("Ajout d’un chapitre :", courseId)}
          onDeleteCourse={() => console.info("Suppression du cours :", courseId)}
        />
      )
    }

    if (depth === 3 && courseId && chapterId) {
      return (
        <ActionButton
          viewLevel="chapter"
          onMarkDone={() => console.info("Chapitre terminé :", chapterId)}
          onDeleteChapter={() => console.info("Chapitre supprimé :", chapterId)}
        />
      )
    }

    return null
  }, [depth, courseId, chapterId])

  const contextValue = useMemo(
    () => ({
      depth,
      activeTab,
      setActiveTab,
      courseId,
      chapterId,
    }),
    [depth, activeTab, courseId, chapterId]
  )

  const gradientClass = useMemo(() => getGradientClasses(isDark), [isDark])

  return (
    <DeepCoursesLayoutContext.Provider value={contextValue}>
      <main
        className={cn(
          "min-h-screen w-full flex flex-col overflow-hidden transition-colors duration-500",
          gradientClass
        )}
      >
        <div
          className={cn(
            "flex flex-1 flex-col gap-14 px-6 py-10 sm:px-10 transition-all duration-500",
            drawerOpen && "blur-md brightness-75 pointer-events-none"
          )}
        >
          {/* --- Header --- */}
          <DeepCourseHeader
            title={headerTitle}
            leftAction={<BackButton onClick={handleNavigateBack} />}
            rightAction={rightAction}
            className="text-foreground"
          >
            {depth === 3 && (
              <DeepCourseTabs
                activeTab={activeTab}
                onChange={setActiveTab}
                onDrawerToggle={setDrawerOpen}
                onEvaluationStateChange={setIsEvaluating}
              />
            )}
          </DeepCourseHeader>

          {/* --- Main layout --- */}
          {depth === 3 ? (
            <div
              className={cn(
                "flex flex-1 items-stretch gap-6 transition-all duration-700 ease-in-out"
              )}
            >
              {/* --- ContentContainer --- */}
              <div
                className={cn(
                  "transition-all duration-700 ease-in-out transform flex items-stretch",
                  isEvaluating
                    ? "flex-[0.7] max-w-[70%] mx-auto translate-x-0"
                    : "flex-[0.7] translate-x-0"
                )}
              >
                <ContentContainer className="flex-1 h-full" />
              </div>

              {/* --- CopiloteContainer --- */}
              <div
                className={cn(
                  "flex-[0.3] h-full transition-all duration-700 ease-in-out transform",
                  isEvaluating
                    ? "opacity-0 pointer-events-none translate-x-12"
                    : "opacity-100 translate-x-0"
                )}
              >
                {!isEvaluating && <CopiloteContainer className="h-full" />}
              </div>
            </div>
          ) : (
            <section className="flex flex-col w-full h-auto">
              <Outlet />
            </section>
          )}
        </div>
      </main>
    </DeepCoursesLayoutContext.Provider>
  )
}
