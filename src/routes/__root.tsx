import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { createServerFn } from "@tanstack/react-start"
import * as React from "react"

import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary.js"
import { NotFound } from "~/components/NotFound.js"
import "~/styles/app.css"
import { seo } from "~/utils/seo.js"
import { useAppSession } from "~/utils/session.js"
import { Toaster } from "~/components/ui/sonner"
import { SettingsProvider } from "~/context/SettingsProvider"
import { CourseTypeProvider } from "~/context/CourseTypeContext"

// Layouts
import { HomeLayout } from "~/layouts/HomeLayout"
import { CourseLayout } from "~/layouts/CourseLayout"
import { ChatQuickViewLayout } from "~/layouts/ChatQuickViewLayout"
import { PageLayout } from "~/layouts/PageLayout"

import { scan } from "react-scan"

scan({
  enabled: process.env.NODE_ENV === "development",
  showToolbar: true,
  log: true,
})

const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useAppSession()
  if (!session.data.userEmail) return null
  return { email: session.data.userEmail }
})

export const Route = createRootRoute({
  beforeLoad: async () => {
    const user = await fetchUser()
    return { user }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...seo({
        title: "TanStack Start | Full-Stack React Framework",
        description: "TanStack Start is a type-safe, client-first framework.",
      }),
    ],
  }),
  errorComponent: (props) => (
    <RootDocument>
      <DefaultCatchBoundary {...props} />
    </RootDocument>
  ),
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { user } = Route.useRouteContext()
  const router = useRouterState()
  const currentPath = router.location.pathname

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem("theme") as "light" | "dark" | null
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches
    const nextTheme = stored ?? (prefersDark ? "dark" : "light")
    window.document.documentElement.classList.toggle("dark", nextTheme === "dark")
  }, [currentPath])

  // Layout exclusions (login/signup)
  const hideLayout = ["/login", "/signup"].includes(currentPath)

  // Détermination du layout à utiliser
  let LayoutComponent: React.FC<{ user?: any; children: React.ReactNode }> = ({ children }) => (
    <main className="flex-1 p-4">{children}</main>
  )

  const isChatHome = currentPath === "/" || currentPath === "/chat"
  const isChatDetail = /^\/chat\/[^/]+/.test(currentPath) // match /chat/$chatId
  const isDeepCourses = currentPath.startsWith("/deep-courses")
  const isCourseDetail = currentPath.startsWith("/cours/")
  const isLayerPage = currentPath.startsWith("/layer")

  if (isChatHome) {
    LayoutComponent = HomeLayout
  } else if (isChatDetail) {
    LayoutComponent = ChatQuickViewLayout
  } else if (isDeepCourses) {
    LayoutComponent = ({ children }) => <>{children}</>
  } else if (isCourseDetail) {
    LayoutComponent = CourseLayout
  } else if (isLayerPage) {
    LayoutComponent = PageLayout
  }


  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh w-full overflow-hidden bg-background text-foreground">
        <SettingsProvider>
          <CourseTypeProvider>
            <div className="flex min-h-dvh w-full flex-1 overflow-hidden">
              {hideLayout ? (
                <main className="flex-1 overflow-auto p-4">{children}</main>
              ) : (
                <LayoutComponent user={user}>{children}</LayoutComponent>
              )}
            </div>

            <Toaster />
            <TanStackRouterDevtools position="bottom-right" />
            <Scripts />
          </CourseTypeProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
