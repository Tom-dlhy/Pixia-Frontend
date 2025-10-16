import { createFileRoute } from "@tanstack/react-router"
import { DeepCourseChapterLayout } from "~/layouts/DeepCourseChapterLayout"

export const Route = createFileRoute(
  "/_authed/deep-courses/$courseId/$chapterId"
)({
  component: DeepCourseChapterView,
})

function DeepCourseChapterView() {
  const { chapterId } = Route.useParams()
  return <DeepCourseChapterLayout chapterId={chapterId} />
}
