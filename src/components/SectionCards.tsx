"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useRouterState } from "@tanstack/react-router"
import { GraduationCap, BookOpen, PenLine, AudioLines } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription } from "~/components/ui/card"
import { cn } from "~/lib/utils"
import { useCourseType } from "~/context/CourseTypeContext"
import dynamic from "next/dynamic"

// ✅ Import dynamique pour éviter les erreurs d’hydratation SSR
const GradientText = dynamic(() => import("./ui/gradient-text").then(m => m.GradientText), {
  ssr: false,
})

type CourseType = "exercice" | "cours" | "discuss" | "deep" | "none"

type GradientMap = Record<"light" | "dark", Record<CourseType, string>>

/* -------------------------------------------------------------------------- */
/* 🌈 Gradients harmonieux pour les titres                                    */
/* -------------------------------------------------------------------------- */

const gradientMap: GradientMap = {
  light: {
    exercice:
      "linear-gradient(90deg, rgba(147,197,253,0.9) 0%, rgba(96,165,250,0.9) 25%, rgba(59,130,246,0.9) 50%, rgba(96,165,250,0.9) 75%, rgba(147,197,253,0.9) 100%)",
    cours:
      "linear-gradient(90deg, rgba(134,239,172,0.9) 0%, rgba(74,222,128,0.9) 25%, rgba(34,197,94,0.9) 50%, rgba(0,196,180,0.9) 75%, rgba(134,239,172,0.9) 100%)",
    discuss:
      "linear-gradient(90deg, rgba(221,214,254,0.9) 0%, rgba(196,181,253,0.9) 25%, rgba(167,139,250,0.9) 50%, rgba(196,181,253,0.9) 75%, rgba(221,214,254,0.9) 100%)",
    deep:
      "linear-gradient(90deg, rgba(147,197,253,0.9) 0%, rgba(167,243,208,0.9) 25%, rgba(110,231,183,0.9) 50%, rgba(96,165,250,0.9) 75%, rgba(147,197,253,0.9) 100%)",
    none:
      "linear-gradient(90deg, rgba(147,197,253,0.9) 0%, rgba(167,243,208,0.9) 25%, rgba(110,231,183,0.9) 50%, rgba(96,165,250,0.9) 75%, rgba(147,197,253,0.9) 100%)",
  },
  dark: {
    exercice:
      "linear-gradient(90deg, rgba(96,165,250,0.8) 0%, rgba(59,130,246,0.8) 25%, rgba(37,99,235,0.8) 50%, rgba(59,130,246,0.8) 75%, rgba(96,165,250,0.8) 100%)",
    cours:
      "linear-gradient(90deg, rgba(74,222,128,0.8) 0%, rgba(34,197,94,0.8) 25%, rgba(21,128,61,0.8) 50%, rgba(0,196,180,0.8) 75%, rgba(74,222,128,0.8) 100%)",
    discuss:
      "linear-gradient(90deg, rgba(196,181,253,0.8) 0%, rgba(167,139,250,0.8) 25%, rgba(139,92,246,0.8) 50%, rgba(167,139,250,0.8) 75%, rgba(196,181,253,0.8) 100%)",
    deep:
      "linear-gradient(90deg, rgba(96,165,250,0.8) 0%, rgba(52,211,153,0.8) 25%, rgba(21,128,61,0.8) 50%, rgba(59,130,246,0.8) 75%, rgba(96,165,250,0.8) 100%)",
    none:
      "linear-gradient(90deg, rgba(96,165,250,0.8) 0%, rgba(52,211,153,0.8) 25%, rgba(21,128,61,0.8) 50%, rgba(59,130,246,0.8) 75%, rgba(96,165,250,0.8) 100%)",
  },
}

/* -------------------------------------------------------------------------- */
/* 🧊 Styles glassmorphism avec teinte dynamique                              */
/* -------------------------------------------------------------------------- */

function glassTint(kind: Exclude<CourseType, "none">, isDark: boolean, isActive: boolean) {
  const base = cn(
    "relative overflow-hidden rounded-[24px] p-6 transition-all duration-500 ease-out cursor-pointer",
    "border border-white/20 backdrop-blur-2xl backdrop-saturate-150",
    "shadow-[0_8px_25px_rgba(0,0,0,0.25)] hover:-translate-y-1 hover:brightness-110",
    "before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/15 before:to-transparent before:pointer-events-none"
  )

  const innerGlow =
    "shadow-[inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_40px_60px_-50px_rgba(255,255,255,0.25)]"

  const active = isActive
    ? "-translate-y-1 brightness-110 ring-2 ring-white/60 dark:ring-white/80 dark:border-white/70"
    : undefined

  const styles = {
    cours: isDark
      ? "bg-[#1de9b6]/40 dark:bg-[#00c4b4]/45 text-white"
      : "bg-[#a7ffee]/70 text-[#0b5e4d] border-white/60 shadow-lg",
    exercice: isDark
      ? "bg-sky-700/45 dark:bg-sky-800/50 text-white"
      : "bg-sky-300/70 text-[#0b294a] border-white/60 shadow-lg",
    discuss: isDark
      ? "bg-violet-700/45 dark:bg-violet-800/50 text-white"
      : "bg-violet-300/70 text-[#2e1b4e] border-white/60 shadow-lg",
    deep: isDark
      ? "bg-rose-700/50 dark:bg-rose-800/55 text-white"
      : "bg-rose-400/70 text-[#4a0a0a] border-white/60 shadow-lg",
  }

  return cn(base, innerGlow, active, styles[kind])
}

/* -------------------------------------------------------------------------- */
/* 🚀 Section principale                                                      */
/* -------------------------------------------------------------------------- */

export function SectionCards() {
  const navigate = useNavigate()
  const location = useRouterState({ select: (state) => state.location })
  const { courseType, setCourseType } = useCourseType()
  const lastLocation = useRef(location.pathname)

  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (typeof document === "undefined") return
    const isDarkMode = () => document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode())

    const observer = new MutationObserver(() => setIsDark(isDarkMode()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  // Reset du courseType à chaque navigation
  useEffect(() => {
    setCourseType("none")
  }, [setCourseType])

  useEffect(() => {
    if (lastLocation.current !== location.pathname) {
      lastLocation.current = location.pathname
      setCourseType("none")
    }
  }, [location.pathname, setCourseType])

  const cards = [
    { key: "deep" as const, title: "Cours Approfondis", description: "Explore des concepts avancés", icon: GraduationCap },
    { key: "cours" as const, title: "Cours Rapides", description: "Apprenez de nouveaux sujets rapidement", icon: BookOpen },
    { key: "exercice" as const, title: "Exercices", description: "Pratiquez vos compétences", icon: PenLine },
    { key: "discuss" as const, title: "Discussion", description: "Discutez librement", icon: AudioLines },
  ]

  const activeGradient =
    gradientMap[isDark ? "dark" : "light"][courseType] ??
    gradientMap[isDark ? "dark" : "light"].none

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* 🌈 Titre avec gradient animé */}
      <div className="text-center text-3xl font-bold mb-10">
        <GradientText
          key={courseType}
          className="text-4xl font-bold"
          text="Bienvenue sur Pixia"
          gradient={activeGradient}
        />
      </div>

      {/* 🧊 Grille des cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map((c, i) => {
          const Icon = c.icon
          return (
            <Card
              key={c.key}
              onClick={() => {
                setCourseType(c.key)
                if (c.key === "deep") navigate({ to: "/deep-courses" })
              }}
              role="button"
              className={cn(glassTint(c.key, isDark, courseType === c.key))}
            >
              <span
                aria-hidden
                className="absolute inset-[-40%_-10%_auto_auto] h-[140px] w-[140px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.35),transparent_60%)] opacity-70 rotate-[25deg]"
              />

              <CardHeader className="relative z-10 p-0">
                <div className="flex items-start justify-between mb-5">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center backdrop-blur-md",
                      isDark ? "bg-white/20" : "bg-white/60"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isDark ? "text-white" : "text-gray-800")} />
                  </div>
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center font-bold backdrop-blur-md",
                      isDark ? "bg-white/20 text-white" : "bg-white/60 text-gray-800"
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>

                <CardTitle
                  className={cn(
                    "text-lg font-semibold mb-2 drop-shadow-sm",
                    isDark ? "text-white" : "text-gray-800"
                  )}
                >
                  {c.title}
                </CardTitle>
                <CardDescription
                  className={cn(
                    "text-sm",
                    isDark ? "text-white/80" : "text-gray-700"
                  )}
                >
                  {c.description}
                </CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
