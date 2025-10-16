import { Outlet, createFileRoute } from "@tanstack/react-router"
import { HomePage } from "~/layouts/HomePage"

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
