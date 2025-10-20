import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/chat/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/chat/"!</div>
}
