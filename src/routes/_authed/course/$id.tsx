import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/course/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/course/$id"!</div>
}
