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
  
  // 🚀 Utiliser le hook de cache - mais avec enabled=false pour ne pas fetcher automatiquement
  const { prefetch } = useSessionCache(null, undefined, undefined, { enabled: false })

  const resolvedEmail = user?.email ?? session.userEmail ?? null
  const sessionFullName = session.givenName || session.familyName
    ? [session.givenName, session.familyName].filter(Boolean).join(" ")
    : null
  const displayName = session.givenName ?? sessionFullName ?? user?.name ?? null
  const enhancedUser = resolvedEmail
    ? {
        email: resolvedEmail,
        name: user?.name ?? sessionFullName ?? null,
        image: user?.image ?? null,
        givenName: user?.givenName ?? session.givenName ?? null,
        familyName: user?.familyName ?? session.familyName ?? null,
      }
    : null

  // Filtrer les sessions en fonction du courseType sélectionné
  const filteredSessions = sessions.filter((session) => {
    // Si courseType === 'none', afficher toutes les sessions
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
    
    // Pour 'discuss' et 'deep', on peut ajouter la logique si nécessaire
    return courseTypeLower === courseType
  })

  // Handler pour prefetch la session et naviguer
  const handleSessionClick = async (sessionId: string, isExercise: boolean) => {
    try {
      const docType = isExercise ? "exercise" : "course"
      
      console.log(`📝 [AppSidebar] Prefetching session: ${sessionId} (${docType})`)
      
      // 🚀 Prefetch les données avant de naviguer
      // React Query va dédupliquer les requêtes qui arrivent au même moment
      prefetch(sessionId, docType)

      // Navigation immédiate (les données seront prêtes quand la route se chargera)
      const route = isExercise ? `/exercise/${sessionId}` : `/course/${sessionId}`
      navigate({ to: route })
      
      console.log(`✅ [AppSidebar] Navigating to ${route}`)
    } catch (err) {
      console.error(`❌ [AppSidebar] Erreur lors du chargement de la session:`, err)
      // On navigue quand même
      const route = isExercise ? `/exercise/${sessionId}` : `/course/${sessionId}`
      navigate({ to: route })
    }
  }

  return (
    <Sidebar className="overflow-visible">
      <SidebarContent className="p-4 space-y-4 overflow-visible flex flex-col">
        {/* 📋 Afficher les sessions si disponibles */}
        {filteredSessions.length > 0 ? (
          <div className="space-y-3 flex flex-col min-h-0 flex-1">
            <h3 className="text-sm font-semibold text-sidebar-foreground/70">
              Historique
              {courseType !== "none" && ` (${courseType})`}
            </h3>
            <div className="space-y-2 overflow-y-auto overflow-x-hidden flex-1 pr-4">
              {filteredSessions.map((session) => {
                // DEBUG: Afficher les infos de la session
                console.log(`📋 [AppSidebar] Session:`, {
                  session_id: session.session_id,
                  title: session.title,
                  document_type: session.document_type,
                  raw_data: session,
                })

                // Déterminer si c'est un exercice (anglais ou français)
                const courseTypeLower = session.document_type?.toLowerCase() || ""
                const isExercise = courseTypeLower === "exercice" || courseTypeLower === "exercise"
                
                console.log(`🔍 [AppSidebar] Type Check:`, {
                  document_type: session.document_type,
                  courseTypeLower,
                  isExercise,
                })
                
                // 🧊 Glassmorphism styles matching global theme
                const baseClass = "w-full justify-start text-left h-12 py-3 px-3 rounded-lg border transition-all duration-300 ease-out cursor-pointer relative"
                const glassBg = "backdrop-blur-xl backdrop-saturate-150 border-white/20 dark:border-white/10"
                const glassGlow = "shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_2px_8px_rgba(0,0,0,0.1)]"
                const glassHover = "hover:scale-[1.02] hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.15)]"
                
                // Couleurs par type
                let bgColor = ""
                let textColor = ""
                
                if (isExercise) {
                  // 🔵 Exercices: Bleu #5C8DD4
                  bgColor = "bg-[rgba(92,141,212,0.25)] dark:bg-[rgba(92,141,212,0.15)]"
                  textColor = "text-[#3d5a8a] dark:text-[#8caff0]"
                } else {
                  // 🟢 Cours: Teinte "verre dépoli" teal/turquoise
                  bgColor = "bg-[rgba(29,233,182,0.2)] dark:bg-[rgba(0,196,180,0.12)]"
                  textColor = "text-[#0b5e4d] dark:text-[#5ef1c2]"
                }

                // Extraire le nom du cours/exercice du titre
                // Format attendu: "NOM_DU_COURS - TITRE_SESSION" ou juste le titre
                const titleParts = session.title?.split(" - ") || []
                const courseName = titleParts.length > 1 ? titleParts[0].trim() : session.title
                const sessionName = titleParts.length > 1 ? titleParts.slice(1).join(" - ").trim() : ""

                console.log(`📝 [AppSidebar] Title Parsing:`, {
                  title: session.title,
                  titleParts,
                  courseName,
                  sessionName,
                })

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
                      <span className="font-medium truncate text-sm">{courseName || "Sans titre"}</span>
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
