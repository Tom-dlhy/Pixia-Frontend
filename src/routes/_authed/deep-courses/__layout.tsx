import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/deep-courses/__layout")({
  component: () => <Outlet />, // Pas de layout pour cette section
})
