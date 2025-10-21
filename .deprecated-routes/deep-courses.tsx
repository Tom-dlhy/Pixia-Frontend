import { createFileRoute } from "@tanstack/react-router"
import { DeepCoursesLayout } from "~/layouts/DeepCoursesLayout"

export const Route = createFileRoute("/_authed/_deprecated/deep-courses")({
  component: DeepCoursesLayout,
})
