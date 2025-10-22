import { createFileRoute, Outlet } from "@tanstack/react-router"
import { HomeLayout } from "~/layouts/HomeLayout"

export const Route = createFileRoute("/_authed/chat")({
  component: () => (
    <HomeLayout>
      <Outlet />
    </HomeLayout>
  ),
})
