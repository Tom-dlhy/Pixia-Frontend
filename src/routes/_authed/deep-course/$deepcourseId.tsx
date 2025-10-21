import { createFileRoute } from "@tanstack/react-router"
import DeepCourseChaptersPage from "~/pages/DeepCourseChaptersPage"

export const Route = createFileRoute("/_authed/deep-course/$deepcourseId")({
  component: DeepCourseChaptersPage,
})
