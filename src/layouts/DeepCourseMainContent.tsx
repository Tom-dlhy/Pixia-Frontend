import { Outlet } from "@tanstack/react-router"
import { cn } from "~/lib/utils"
import ContentContainer from "~/layouts/ContentContainer"
import CopiloteContainer from "~/layouts/CopiloteContainer"
import { ChapterDocumentContainer } from "~/layouts/ChapterDocumentContainer"
import { useDeepCourseParams } from "~/hooks/useDeepCourseNavigation"
import { useAppSession } from "~/utils/session"
import { useMemo, useEffect } from "react"

interface DeepCourseMainContentProps {
  isEvaluating: boolean
}

export function DeepCourseMainContent({ isEvaluating }: DeepCourseMainContentProps) {
  const { depth, chapterId, deepcourseId } = useDeepCourseParams()
  const { session } = useAppSession()
  
  // 🔹 Récupération du userId depuis la session
  const userId = useMemo(() => {
    if (session.userId != null) {
      return String(session.userId)
    }
    return null
  }, [session.userId])

  // 🔍 Log seulement quand les params changent (une fois par changement, pas à chaque rendu)
  useEffect(() => {
    console.log(`🔍 [DeepCourseMainContent] depth=${depth}, chapterId=${chapterId}`)
  }, [depth, chapterId])

  // À depth === 3 : affiche le contenu du chapitre avec le copilote
  if (depth === 3) {
    return (
      <div className={cn(
        "flex flex-1 gap-6 overflow-hidden min-h-0"
      )}>
        {/* Content */}
        <div
          className={cn(
            "flex flex-[0.7] flex-col overflow-hidden min-h-0 transition-all duration-700 ease-in-out",
            isEvaluating ? "flex-[0.7]" : "flex-[0.7]"
          )}
        >
          <ContentContainer className="flex-1 h-full overflow-hidden">
            <ChapterDocumentContainer />
          </ContentContainer>
        </div>

        {/* Copilote */}
        <div
          className={cn(
            "flex flex-[0.3] flex-col overflow-hidden min-h-0 transition-all duration-700 ease-in-out",
            isEvaluating
              ? "opacity-0 pointer-events-none"
              : "opacity-100"
          )}
        >
          {!isEvaluating && <CopiloteContainer className="h-full overflow-hidden" sessionId={chapterId} userId={userId} courseType="deep" deepCourseId={deepcourseId} />}
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
