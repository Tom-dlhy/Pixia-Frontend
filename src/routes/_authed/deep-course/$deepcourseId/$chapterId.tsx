import { createFileRoute } from "@tanstack/react-router"
import { DeepCoursesLayout } from "~/layouts/DeepCoursesLayout"

export const Route = createFileRoute("/_authed/deep-course/$deepcourseId/$chapterId")({
  component: DeepCoursesLayout,
})
