"use client"

import React, { useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar"
import { AppSidebar } from "~/components/AppSidebar"
import { GradientBackground } from "~/components/ui/gradient-background"
import { getGradientClasses } from "~/utils/getGradientClasses"
import { Button } from "~/components/ui/button"

export function HomeLayout({ user, children }: { user?: any; children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <HomeLayoutContent user={user}>{children}</HomeLayoutContent>
    </SidebarProvider>
  )
}

function HomeLayoutContent({ user, children }: { user?: any; children: React.ReactNode }) {

  // 🌙 Gestion du thème
  const [isDark, setIsDark] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  )
  
  const navigate = useNavigate()

  useEffect(() => {
    if (typeof document === "undefined") return
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

    // 💬 États du chat
  const gradientClass = getGradientClasses(isDark)

  return (
    <div className="flex h-dvh w-full overflow-hidden text-sidebar-foreground transition-all duration-500">
      <AppSidebar user={user} />
      <SidebarInset className="relative flex flex-1 flex-col overflow-hidden">
        {/* 🌈 Fond dynamique */}
        <GradientBackground key={gradientClass} className={`absolute inset-0 ${gradientClass}`}>
          <div className="absolute inset-0 backdrop-blur-2xl transition-colors duration-700" />
        </GradientBackground>

        <main className="relative z-10 flex flex-col w-full h-full overflow-y-auto px-4 sm:px-6 lg:px-10 py-8">
          {/* Debug Buttons */}
          <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
            {/* Green button for /course */}
            <Button
              onClick={() => navigate({ to: "/course/$id", params: { id: "test-course-id" } as any })}
              className="rounded-full bg-green-500 hover:bg-green-600 transition-all"
            >
              🟢
            </Button>
            
            {/* Blue button for /exercise */}
            <Button
              onClick={() => navigate({ to: "/exercise/$id", params: { id: "test-exercise-id" } as any })}
              className="rounded-full bg-blue-500 hover:bg-blue-600 transition-all"
            >
              🔵
            </Button>
          </div>
          
          <section className="flex flex-1 flex-col gap-8 min-h-0">
            {children}
          </section>
        </main>
      </SidebarInset>
    </div>
  )
}
