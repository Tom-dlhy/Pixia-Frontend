import { createFileRoute } from '@tanstack/react-router'
import { ChatQuickViewLayout } from "~/layouts/ChatQuickViewLayout"

export const Route = createFileRoute('/_authed/course')({
  component: RouteComponent,
})

function RouteComponent() {
    <ChatQuickViewLayout>
      <div>Hello "/_authed/course"!</div>
    </ChatQuickViewLayout>
}
