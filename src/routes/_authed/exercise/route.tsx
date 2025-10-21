import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ChatQuickViewLayout } from "~/layouts/ChatQuickViewLayout"
import { DocumentTitleProvider } from "~/context/DocumentTitleContext"

export const Route = createFileRoute('/_authed/exercise')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <DocumentTitleProvider>
      <ChatQuickViewLayout courseType="exercice">
        <Outlet />
      </ChatQuickViewLayout>
    </DocumentTitleProvider>
  )
}
