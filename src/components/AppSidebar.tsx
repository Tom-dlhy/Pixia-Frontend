import { Sidebar, SidebarContent, SidebarFooter } from "~/components/ui/sidebar"
import { NavGuest, NavUser } from "~/components/NavUser"
import { useAppSession } from "~/utils/session"
import { useChatSessions } from "~/context/ChatSessionsContext"
import { useCourseType } from "~/context/CourseTypeContext"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { useSessionCache } from "~/hooks/useSessionCache"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty"
import { MessageSquare } from "lucide-react"

type AppSidebarProps = {
  user?: {
    email: string
    name?: string | null
    image?: string | null
    givenName?: string | null
    familyName?: string | null
  } | null
}

export function AppSidebar({ user }: AppSidebarProps) {
  const { session } = useAppSession()
  const { sessions } = useChatSessions()
  const { courseType } = useCourseType()
  const navigate = useNavigate()
  
  const { prefetch } = useSessionCache(null, undefined, undefined, { enabled: false })

  const resolvedEmail = user?.email ?? session.userEmail ?? null
  const displayName = session.name ?? user?.name ?? null
  const enhancedUser = resolvedEmail
    ? {
        email: resolvedEmail,
        name: user?.name ?? session.name ?? null,
        image: user?.image ?? null,
        givenName: user?.givenName ?? null,
        familyName: user?.familyName ?? null,
      }
    : null

  const filteredSessions = sessions.filter((session) => {
    if (courseType === "none") {
      return true
    }
    
    const courseTypeLower = session.document_type?.toLowerCase() || ""
    
    if (courseType === "exercice") {
      return courseTypeLower === "exercice" || courseTypeLower === "exercise"
    }
    
    if (courseType === "cours") {
      return courseTypeLower === "cours" || courseTypeLower === "course"
    }
    
    return courseTypeLower === courseType
  })

  const handleSessionClick = async (sessionId: string, isExercise: boolean) => {
    try {
      const docType = isExercise ? "exercise" : "course"
      
      
      
      prefetch(sessionId, docType)

      const route = isExercise ? `/exercise/${sessionId}` : `/course/${sessionId}`
      navigate({ to: route })
      
    } catch (err) {
      console.error(`[AppSidebar] Erreur lors du chargement de la session:`, err)
      const route = isExercise ? `/exercise/${sessionId}` : `/course/${sessionId}`
      navigate({ to: route })
    }
  }

  return (
    <Sidebar className="overflow-visible">
      <SidebarContent className="p-4 space-y-4 overflow-visible flex flex-col">
        {filteredSessions.length > 0 ? (
          <div className="space-y-3 flex flex-col min-h-0 flex-1">
            <h3 className="text-sm font-semibold text-sidebar-foreground/70">
              Historique
              {courseType !== "none" && ` (${courseType})`}
            </h3>
            <div className="space-y-2 overflow-y-auto overflow-x-hidden flex-1 pr-4">
              {filteredSessions.map((session) => {
                const courseTypeLower = session.document_type?.toLowerCase() || ""
                const isExercise = courseTypeLower === "exercice" || courseTypeLower === "exercise"
                
                const baseClass = "w-full justify-start text-left h-auto py-2 px-4 rounded-lg border transition-all duration-300 ease-out cursor-pointer relative"
                const glassBg = "backdrop-blur-xl backdrop-saturate-150 border-white/20 dark:border-white/10"
                const glassGlow = "shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_2px_8px_rgba(0,0,0,0.1)]"
                const glassHover = "hover:scale-[1.02] hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.15)]"
                
                let bgColor = ""
                let textColor = ""
                
                if (isExercise) {
                  bgColor = "bg-[rgba(92,141,212,0.25)] dark:bg-[rgba(92,141,212,0.15)]"
                  textColor = "text-[#3d5a8a] dark:text-[#8caff0]"
                } else {
                  bgColor = "bg-[rgba(29,233,182,0.2)] dark:bg-[rgba(0,196,180,0.12)]"
                  textColor = "text-[#0b5e4d] dark:text-[#5ef1c2]"
                }

                return (
                  <Button
                    key={session.session_id}
                    onClick={() => handleSessionClick(session.session_id, isExercise)}
                    variant="ghost"
                    className={cn(
                      baseClass,
                      glassBg,
                      glassGlow,
                      glassHover,
                      bgColor,
                      textColor
                    )}
                  >
                    <div className="flex flex-col gap-0.5 w-full truncate">
                      <span className="font-medium truncate text-sm">{session.title || "Sans titre"}</span>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageSquare className="size-6" />
              </EmptyMedia>
              <EmptyTitle>
                {courseType !== "none" 
                  ? `Aucune conversation de type "${courseType}"` 
                  : "Aucune conversation pour l'instant"}
              </EmptyTitle>
              <EmptyDescription>
                {courseType !== "none"
                  ? `Sélectionne "Tout afficher" pour voir toutes les conversations.`
                  : displayName
                  ? `Commence, ${displayName}, une discussion pour remplir cette liste.`
                  : "Lance ta première discussion pour voir apparaître tes chats ici."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <p className="text-muted-foreground">
                {courseType !== "none"
                  ? "Crée une nouvelle conversation de ce type."
                  : "Crée un nouveau chat ou sélectionne une conversation existante pour la retrouver facilement."}
              </p>
            </EmptyContent>
          </Empty>
        )}
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-sidebar-border pt-2">
        {enhancedUser ? <NavUser user={enhancedUser} /> : <NavGuest />}
      </SidebarFooter>
    </Sidebar>
  )
}
