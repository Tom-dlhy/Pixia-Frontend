import { createFileRoute } from "@tanstack/react-router"
import DeepCourseListPage from "~/pages/DeepCourseListPage"

export const Route = createFileRoute("/_authed/deep-course/")({
  component: DeepCourseListPage,
})

export default Route.component
