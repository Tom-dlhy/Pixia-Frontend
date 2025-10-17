import { Link } from "@tanstack/react-router"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import { Home, Inbox, Calendar, Search, Settings } from "lucide-react"
import { NavGuest, NavUser } from "~/components/NavUser"
import { useAppSession } from "~/utils/session"

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

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Inbox", url: "/inbox", icon: Inbox },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Search", url: "/search", icon: Search },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar({ user }: AppSidebarProps) {
  const { session } = useAppSession()
  const resolvedEmail = user?.email ?? session.userEmail ?? null
  const sessionFullName = session.givenName || session.familyName
    ? [session.givenName, session.familyName].filter(Boolean).join(" ")
    : null
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-sidebar-border pt-2">
        {enhancedUser ? <NavUser user={enhancedUser} /> : <NavGuest />}
      </SidebarFooter>
    </Sidebar>
  )
}
