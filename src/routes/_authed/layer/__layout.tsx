import { createFileRoute, Outlet } from "@tanstack/react-router"
import { PageLayout } from "~/layouts/PageLayout"

export const Route = createFileRoute("/_authed/layer/__layout")({
  component: () => (
    <PageLayout>
      <Outlet />
    </PageLayout>
  ),
})
