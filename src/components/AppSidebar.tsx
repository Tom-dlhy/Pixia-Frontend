import { Sidebar, SidebarContent, SidebarFooter } from "~/components/ui/sidebar"
import { NavGuest, NavUser } from "~/components/NavUser"
import { useAppSession } from "~/utils/session"
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
    locale?: string | null
  } | null
}

export function AppSidebar({ user }: AppSidebarProps) {
  const { session } = useAppSession()
  const resolvedEmail = user?.email ?? session.userEmail ?? null
  const sessionFullName = session.givenName || session.familyName
    ? [session.givenName, session.familyName].filter(Boolean).join(" ")
    : null
  const displayName = session.givenName ?? sessionFullName ?? user?.name ?? null
  const enhancedUser = resolvedEmail
    ? {
        email: resolvedEmail,
        name: user?.name ?? sessionFullName ?? null,
        image: user?.image ?? session.picture ?? null,
        givenName: user?.givenName ?? session.givenName ?? null,
        familyName: user?.familyName ?? session.familyName ?? null,
        locale: user?.locale ?? session.locale ?? null,
        picture: session.picture ?? user?.image ?? null,
      }
    : null

  return (
    <Sidebar>
      <SidebarContent className="p-4">
        <Empty >
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquare className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Aucune conversation pour l’instant</EmptyTitle>
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
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-sidebar-border pt-2">
        {enhancedUser ? <NavUser user={enhancedUser} /> : <NavGuest />}
      </SidebarFooter>
    </Sidebar>
  )
}
