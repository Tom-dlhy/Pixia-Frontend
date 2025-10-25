"use client"
/// <reference types="vite/client" />

import * as React from "react"
import {
  HeadContent,
  Scripts,
  Outlet,
  createRootRoute,
  type ErrorComponentProps,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { scan } from "react-scan"

import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary"
import { NotFound } from "~/components/NotFound"
import { Toaster } from "~/components/ui/sonner"
import { seo } from "~/utils/seo"

import { SessionProvider } from "~/utils/session"
import { SettingsProvider } from "~/context/SettingsProvider"
import { CourseTypeProvider } from "~/context/CourseTypeContext"
import { CourseContentProvider } from "~/context/CourseContentContext"
import { ChatSessionsProvider } from "~/context/ChatSessionsContext"
import { QueryProvider } from "~/context/QueryProvider"

import appCss from '~/styles/app.css?url'

// --- Root Route Definition ---
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...seo({
        title: "Pixia - Votre assistant d'apprentissage intelligent",
        description: "Progressez plus vite avec Pixia, votre compagnon d'étude personnalisé propulsé par l'intelligence artificielle.",
      }),
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),

  errorComponent: (props: ErrorComponentProps) => (
    <DefaultCatchBoundary {...props} />
  ),
  notFoundComponent: () => <NotFound />,

  component: RootApp,
})

// --- Root Providers Wrapper ---
function RootApp() {
  return (
    <QueryProvider>
      <SessionProvider>
        <SettingsProvider>
          <CourseTypeProvider>
            <CourseContentProvider>
              <ChatSessionsProvider>
                <AppShell />
              </ChatSessionsProvider>
            </CourseContentProvider>
          </CourseTypeProvider>
        </SettingsProvider>
      </SessionProvider>
    </QueryProvider>
  )
}

// --- Shell with Layout, Theme & Global Tools ---
function AppShell() {
  React.useEffect(() => {
    // --- Thème clair/sombre ---
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem("theme") as "light" | "dark" | null
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches
    const nextTheme = stored ?? (prefersDark ? "dark" : "light")
    document.documentElement.classList.toggle("dark", nextTheme === "dark")
  }, [])

  // --- Activation de React Scan en mode développement ---
  if (process.env.NODE_ENV === "development") {
    scan({
      enabled: true,
      showToolbar: true,
      log: true,
    })
  }

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh w-full overflow-hidden bg-background text-foreground">
        <main className="flex min-h-dvh w-full flex-1 overflow-hidden">
          <Outlet />
        </main>

        {/* --- Global UI Components --- */}
        <Toaster />
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
