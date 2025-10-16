"use client"

import React, { useEffect, useState } from "react"
import { useRouterState } from "@tanstack/react-router"
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar"
import { AppSidebar } from "~/components/AppSidebar"
import { Chat } from "~/components/Chat"
import { SectionCards } from "~/components/SectionCards"
import { useCourseType } from "~/context/CourseTypeContext"
import { getCourseAccent } from "~/utils/courseTypeStyles"
import { GradientBackground } from "~/components/ui/gradient-background"
import { getGradientClasses } from "~/utils/getGradientClasses"
import { cn } from "~/lib/utils"

export function HomeLayout({
  user,
  children,
}: {
  user?: any
  children: React.ReactNode
}) {
  const { location } = useRouterState()
  const { courseType } = useCourseType()
  const [isDark, setIsDark] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  )

  // ✅ Écoute les changements de classe "dark" sur le document
  useEffect(() => {
    if (typeof document === "undefined") return

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"))
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  const accentKey = courseType === "deep" ? "none" : courseType
  const accent = getCourseAccent(accentKey)
  const showChatHome = location.pathname === "/" || location.pathname === "/chat"
  const gradientClass = getGradientClasses(isDark)

  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full overflow-hidden text-sidebar-foreground">
        <AppSidebar user={user} />

        <SidebarInset className="relative flex flex-1 flex-col overflow-hidden">
          {/* ✅ Le fond change en temps réel quand le thème bascule */}
          <GradientBackground key={gradientClass} className={`absolute inset-0 ${gradientClass}`}>
            <div
              className={cn(
                "absolute inset-0 backdrop-blur-2xl transition-colors duration-700"
              )}
            />
          </GradientBackground>


          <main className="relative z-10 flex flex-col w-full h-full overflow-y-auto px-4 sm:px-6 lg:px-10 py-8">
            <section className="flex flex-1 flex-col gap-8 min-h-0">
              {children && <div className="w-full max-w-4xl mx-auto">{children}</div>}

              {showChatHome && (
                <>
                  <div className="w-full max-w-4xl mx-auto">
                    <SectionCards />
                  </div>

                  <div className="w-full max-w-4xl flex-1 flex flex-col min-h-0 mx-auto">
                    <Chat />
                  </div>
                </>
              )}
            </section>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
