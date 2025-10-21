import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ChatQuickViewLayout } from "~/layouts/ChatQuickViewLayout"

export const Route = createFileRoute('/_authed/exercise')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ChatQuickViewLayout courseType="exercice">
      <Outlet />
    </ChatQuickViewLayout>
  )
}
