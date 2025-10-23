import { createFileRoute } from "@tanstack/react-router"
import { DeepCoursesLayout } from "~/layouts/DeepCoursesLayout"
import { DocumentTitleProvider } from "~/context/DocumentTitleContext"

export const Route = createFileRoute("/_authed/deep-course/$deepcourseId/$chapterId")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <DocumentTitleProvider>
      <DeepCoursesLayout />
    </DocumentTitleProvider>
  )
}
