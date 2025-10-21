import { Sidebar, SidebarContent, SidebarFooter } from "~/components/ui/sidebar"
import { NavGuest, NavUser } from "~/components/NavUser"
import { useAppSession } from "~/utils/session"
import { useChatSessions } from "~/context/ChatSessionsContext"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { getChat } from "~/server/chat.server"
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
  const navigate = useNavigate()

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

  // Handler pour charger la session et naviguer
  const handleSessionClick = async (sessionId: string, isExercise: boolean) => {
    try {
      const userId = session.userId != null ? String(session.userId) : "anonymous-user"
      
      console.log(`📝 [AppSidebar] Chargement de la session: ${sessionId}`)
      
      // Appel à getChat pour récupérer l'historique
      await getChat({
        data: {
          user_id: userId,
          session_id: sessionId,
        },
      })

      // Navigation après chargement réussi
      const route = isExercise ? `/exercise/${sessionId}` : `/course/${sessionId}`
      navigate({ to: route })
      
      console.log(`✅ [AppSidebar] Session chargée et navigation vers ${route}`)
    } catch (err) {
      console.error(`❌ [AppSidebar] Erreur lors du chargement de la session:`, err)
      // On navigue quand même
      const route = isExercise ? `/exercise/${sessionId}` : `/course/${sessionId}`
      navigate({ to: route })
    }
  }

  return (
    <Sidebar>
      <SidebarContent className="p-4 space-y-4">
        {/* 📋 Afficher les sessions si disponibles */}
        {sessions.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-sidebar-foreground/70">Historique</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sessions.map((session) => {
                // Déterminer si c'est un exercice (anglais ou français)
                const courseTypeLower = session.course_type?.toLowerCase() || ""
                const isExercise = courseTypeLower === "exercice" || courseTypeLower === "exercise"
                
                const bgColor = isExercise ? "bg-blue-500/10 hover:bg-blue-500/20" : "bg-green-500/10 hover:bg-green-500/20"
                const textColor = isExercise ? "text-blue-600 dark:text-blue-300" : "text-green-600 dark:text-green-300"
                const borderColor = isExercise ? "border-blue-500/30" : "border-green-500/30"

                return (
                  <Button
                    key={session.session_id}
                    onClick={() => handleSessionClick(session.session_id, isExercise)}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left h-auto py-2 px-2 rounded-md border text-xs transition-all",
                      bgColor,
                      borderColor,
                      textColor
                    )}
                  >
                    <div className="flex flex-col gap-0.5 w-full truncate">
                      <span className="font-medium truncate">{session.title || "Sans titre"}</span>
                      <span className="text-xs opacity-70">
                        {isExercise ? "🔵 Exercice" : "🟢 Cours"}
                      </span>
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
              <EmptyTitle>Aucune conversation pour l'instant</EmptyTitle>
              <EmptyDescription>
                {displayName
                  ? `Commence, ${displayName}, une discussion pour remplir cette liste.`
                  : "Lance ta première discussion pour voir apparaître tes chats ici."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <p className="text-muted-foreground">
                Crée un nouveau chat ou sélectionne une conversation existante pour la retrouver facilement.
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
