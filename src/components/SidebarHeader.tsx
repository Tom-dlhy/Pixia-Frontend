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
import { MessageSquare, Plus } from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

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

export function SidebarHeader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-md bg-sidebar-accent/20 px-3 py-2 mb-4 border border-sidebar-border/50",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-sidebar-accent/40 p-1.5">
          <MessageSquare className="h-4 w-4 text-sidebar-foreground" />
        </div>
        <h2 className="text-sm font-semibold text-sidebar-foreground">
          Conversations Rapides
        </h2>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-sidebar-foreground"
        aria-label="Nouvelle conversation"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

