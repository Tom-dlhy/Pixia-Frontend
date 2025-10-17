import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/chat")({
  component: ChatLayout,
})

function ChatLayout() {
  return (
    <>
      <Outlet />
    </>
  )
}
