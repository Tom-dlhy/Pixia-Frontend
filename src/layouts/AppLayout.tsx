"use client"

import React, { useMemo } from "react"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"
import { AppSidebar } from "~/components/AppSidebar"
import { useCourseType } from "~/context/CourseTypeContext"
import { getCourseAccent } from "~/utils/courseTypeStyles"

interface AppLayoutProps {
  user?: any
  children: React.ReactNode
}

export function AppLayout({ user, children }: AppLayoutProps) {
  const { courseType } = useCourseType()
  const accentKey = courseType === "deep" ? "none" : courseType
  const accent = getCourseAccent(accentKey)

  const neonLayoutStyle = useMemo(
    () =>
      ({
        "--neon-gradient": accent.gradient,
        "--neon-glow": accent.glow,
        "--neon-surface": "hsl(var(--background) / 0.94)",
        "--neon-border-width": "1.5px",
        "--neon-radius": "0px",
      }) as React.CSSProperties,
    [accent],
  )

  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full overflow-hidden bg-sidebar text-sidebar-foreground">
        {/* Sidebar gauche */}
        <AppSidebar user={user} />

        {/* Zone principale */}
        <SidebarInset className="relative flex h-full flex-1 flex-col overflow-hidden bg-transparent">
          <div className="neon-motion-border flex h-full w-full" style={neonLayoutStyle}>
            <div className="neon-motion-border__inner flex h-full w-full">
              <div className="neon-motion-border__core flex h-full w-full overflow-hidden bg-transparent">
                <div className="flex h-full flex-1 flex-col overflow-hidden p-4 sm:p-6 lg:p-10">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
