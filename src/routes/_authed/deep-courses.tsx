import { createFileRoute } from "@tanstack/react-router"
import { DeepCoursesLayout } from "~/layouts/DeepCoursesLayout"

export const Route = createFileRoute("/_authed/deep-courses")({
  component: DeepCoursesLayout,
})
