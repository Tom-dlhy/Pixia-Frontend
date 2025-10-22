import { Outlet } from "@tanstack/react-router"
import { cn } from "~/lib/utils"
import ContentContainer from "~/layouts/ContentContainer"
import CopiloteContainer from "~/layouts/CopiloteContainer"
import { useDeepCourseParams } from "~/hooks/useDeepCourseNavigation"

interface DeepCourseMainContentProps {
  isEvaluating: boolean
}

export function DeepCourseMainContent({ isEvaluating }: DeepCourseMainContentProps) {
  const { depth, chapterId } = useDeepCourseParams()

  console.log(`🔍 [DeepCourseMainContent] depth=${depth}, chapterId=${chapterId}`)

  // À depth === 3 : affiche le contenu du chapitre avec le copilote
  if (depth === 3) {
    return (
      <div className={cn("flex flex-1 items-stretch gap-6 transition-all duration-700 ease-in-out")}>
        {/* Content */}
        <div
          className={cn(
            "transition-all duration-700 ease-in-out transform flex items-stretch",
            isEvaluating ? "flex-[0.7] max-w-[70%] mx-auto translate-x-0" : "flex-[0.7] translate-x-0"
          )}
        >
          <ContentContainer className="flex-1 h-full" />
        </div>

        {/* Copilote */}
        <div
          className={cn(
            "flex-[0.3] h-full transition-all duration-700 ease-in-out transform",
            isEvaluating
              ? "opacity-0 pointer-events-none translate-x-12"
              : "opacity-100 translate-x-0"
          )}
        >
          {!isEvaluating && <CopiloteContainer className="h-full" sessionId={chapterId} />}
        </div>
      </div>
    )
  }

  // À depth < 3 : affiche la page Outlet (liste ou chapitres)
  return (
    <section className="flex flex-col w-full h-auto">
      <Outlet />
    </section>
  )
}
