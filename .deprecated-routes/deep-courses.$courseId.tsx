import { Outlet, createFileRoute } from "@tanstack/react-router"

function DeepCourseRouteLayout() {
  return <Outlet />
}

export const Route = createFileRoute("/_authed/_deprecated/deep-courses/$courseId")({
  component: DeepCourseRouteLayout,
})
