"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import { useCourseType } from "~/context/CourseTypeContext"
import {
  DeepCoursesLayoutContext,
  DeepCoursesTab,
} from "~/layouts/DeepCourseContext"

import DeepCourseHeader from "~/layouts/DeepCourseHeader"
import DeepCourseTabs from "~/layouts/DeepCourseTabs"
import { DeepCourseMainContent } from "~/layouts/DeepCourseMainContent"
import { CopiloteModal } from "~/layouts/CopiloteModal"
import BackButton from "~/components/BackButton"
import ActionButton from "~/components/ActionButton"
import { cn } from "~/lib/utils"
import { getGradientClasses } from "~/utils/getGradientClasses"
import type { CourseType } from "~/context/CourseTypeContext"

import {
  useDeepCourseParams,
  useDeepCourseNavigation,
  useHeaderTitle,
  useHeaderIcon,
  useRightAction,
} from "~/hooks/useDeepCourseNavigation"

export function DeepCoursesLayout() {
  const { setCourseType } = useCourseType()
  const { depth, deepcourseId, chapterId } = useDeepCourseParams()
  const { handleNavigateBack } = useDeepCourseNavigation()
  const headerTitle = useHeaderTitle()
  const headerIcon = useHeaderIcon()
  const rightActionConfig = useRightAction()

  const [activeTab, setActiveTab] = useState<DeepCoursesTab>("cours")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [isCopiloteModalOpen, setIsCopiloteModalOpen] = useState(false)
  const [isDark, setIsDark] = useState(
    typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")
  )

  const courseGradient = useMemo(() => {
    if (!deepcourseId) return ""
    return localStorage.getItem(`deepcourse-gradient-${deepcourseId}`) || ""
  }, [deepcourseId])

  useEffect(() => {
    const courseType: CourseType = depth === 3
      ? (activeTab === "cours" ? "cours" : activeTab === "exercice" ? "exercice" : "deep")
      : "deep"
    setCourseType(courseType)
  }, [depth, activeTab, setCourseType])

  useEffect(() => {
    if (depth < 3) setActiveTab("cours")
  }, [depth])

  useEffect(() => {
    setIsEvaluating(false)
  }, [chapterId])

  const handleOpenCopiloteModal = () => {
    setIsCopiloteModalOpen(true)
  }

  const handleCloseCopiloteModal = () => {
    setIsCopiloteModalOpen(false)
  }

  const enrichedActionConfig = useMemo(() => {
    if (!rightActionConfig) return null
    
    return {
      ...rightActionConfig,
      onCreateCourse: handleOpenCopiloteModal,
      onAddChapter: handleOpenCopiloteModal,
    }
  }, [rightActionConfig])

  const contextValue = useMemo(
    () => ({
      depth,
      activeTab,
      setActiveTab,
      deepcourseId,
      chapterId,
    }),
    [depth, activeTab, deepcourseId, chapterId]
  )

  const gradientClass = useMemo(() => getGradientClasses(isDark), [isDark])

  return (
    <DeepCoursesLayoutContext.Provider value={contextValue}>
      <main
        className={cn(
          "h-dvh w-full flex flex-col overflow-hidden transition-colors duration-500",
          gradientClass
        )}
      >
        <div className={cn(
          "flex-shrink-0 px-6 py-10 sm:px-10 transition-all duration-500",
          (drawerOpen || isCopiloteModalOpen) && "blur-md brightness-75 pointer-events-none"
        )}>
          <DeepCourseHeader
            title={headerTitle}
            leftAction={<BackButton onClick={handleNavigateBack} />}
            rightAction={enrichedActionConfig ? <ActionButton {...enrichedActionConfig} /> : null}
            className="text-foreground"
            iconType={headerIcon}
            titleGradient={courseGradient}
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
        </div>

        <div className={cn(
          "flex flex-1 overflow-hidden px-6 pb-10 pt-6 sm:px-10 min-h-0 transition-all duration-500",
          (drawerOpen || isCopiloteModalOpen) && "blur-md brightness-75 pointer-events-none"
        )}>
          <DeepCourseMainContent isEvaluating={isEvaluating} />
        </div>

        <CopiloteModal
          isOpen={isCopiloteModalOpen}
          onClose={handleCloseCopiloteModal}
          sessionId={chapterId}
          deepCourseId={deepcourseId}
        />
      </main>
    </DeepCoursesLayoutContext.Provider>
  )
}
