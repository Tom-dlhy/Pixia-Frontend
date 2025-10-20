import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/chat/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/chat/$id"!</div>
}
