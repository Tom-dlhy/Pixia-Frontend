"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { GraduationCap, BookOpen, PenLine, AudioLines } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription } from "~/components/ui/card"
import { cn } from "~/lib/utils"
import { useCourseType } from "~/context/CourseTypeContext"
import { GradientText } from "./ui/gradient-text"

/* -------------------------------------------------------------------------- */
/* 🧩 Typage strict des clés et du mapping                                    */
/* -------------------------------------------------------------------------- */

type CourseType = "exercice" | "cours" | "discuss" | "deep" | "none"

type GradientMap = Record<
  "light" | "dark",
  Record<CourseType, string>
>

/* -------------------------------------------------------------------------- */
/* 🌈 Gradients doux et harmonieux pour glassmorphism Apple                   */
/* -------------------------------------------------------------------------- */

const gradientMap: GradientMap = {
  light: {
    exercice:
      "linear-gradient(90deg, rgba(147,197,253,0.9) 0%, rgba(96,165,250,0.9) 25%, rgba(59,130,246,0.9) 50%, rgba(96,165,250,0.9) 75%, rgba(147,197,253,0.9) 100%)", // bleu
    cours:
      "linear-gradient(90deg, rgba(134,239,172,0.9) 0%, rgba(74,222,128,0.9) 25%, rgba(34,197,94,0.9) 50%, rgba(0,196,180,0.9) 75%, rgba(134,239,172,0.9) 100%)", // vert menthe doux
    discuss:
      "linear-gradient(90deg, rgba(221,214,254,0.9) 0%, rgba(196,181,253,0.9) 25%, rgba(167,139,250,0.9) 50%, rgba(196,181,253,0.9) 75%, rgba(221,214,254,0.9) 100%)", // violet pastel
    deep:
      "linear-gradient(90deg, rgba(147,197,253,0.9) 0%, rgba(167,243,208,0.9) 25%, rgba(110,231,183,0.9) 50%, rgba(96,165,250,0.9) 75%, rgba(147,197,253,0.9) 100%)", // bleu-vert doux
    none:
      "linear-gradient(90deg, rgba(147,197,253,0.9) 0%, rgba(167,243,208,0.9) 25%, rgba(110,231,183,0.9) 50%, rgba(96,165,250,0.9) 75%, rgba(147,197,253,0.9) 100%)", // fallback doux
  },

  dark: {
    exercice:
      "linear-gradient(90deg, rgba(96,165,250,0.8) 0%, rgba(59,130,246,0.8) 25%, rgba(37,99,235,0.8) 50%, rgba(59,130,246,0.8) 75%, rgba(96,165,250,0.8) 100%)", // bleu
    cours:
      "linear-gradient(90deg, rgba(74,222,128,0.8) 0%, rgba(34,197,94,0.8) 25%, rgba(21,128,61,0.8) 50%, rgba(0,196,180,0.8) 75%, rgba(74,222,128,0.8) 100%)", // vert menthe harmonisé
    discuss:
      "linear-gradient(90deg, rgba(196,181,253,0.8) 0%, rgba(167,139,250,0.8) 25%, rgba(139,92,246,0.8) 50%, rgba(167,139,250,0.8) 75%, rgba(196,181,253,0.8) 100%)", // violet
    deep:
      "linear-gradient(90deg, rgba(96,165,250,0.8) 0%, rgba(52,211,153,0.8) 25%, rgba(21,128,61,0.8) 50%, rgba(59,130,246,0.8) 75%, rgba(96,165,250,0.8) 100%)", // bleu-vert doux
    none:
      "linear-gradient(90deg, rgba(96,165,250,0.8) 0%, rgba(52,211,153,0.8) 25%, rgba(21,128,61,0.8) 50%, rgba(59,130,246,0.8) 75%, rgba(96,165,250,0.8) 100%)", // fallback bleu-vert
  },
}

/* -------------------------------------------------------------------------- */
/* 🧊 Styles glassmorphism universels avec teinte dynamique                   */
/* -------------------------------------------------------------------------- */
function glassTint(kind: Exclude<CourseType, "none">, isDark: boolean) {
  const base = cn(
    "relative overflow-hidden rounded-[24px] p-6 transition-all duration-500 ease-out cursor-pointer",
    "border border-white/20 backdrop-blur-2xl backdrop-saturate-150",
    "shadow-[0_8px_25px_rgba(0,0,0,0.25)] hover:-translate-y-1 hover:brightness-110",
    "before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/15 before:to-transparent before:pointer-events-none"
  )

  const innerGlow =
    "shadow-[inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_40px_60px_-50px_rgba(255,255,255,0.25)]"

  if (isDark) {
    // 🌙 Couleurs sombres harmonisées
    switch (kind) {
      case "cours": // 💚 vert turquoise harmonisé
        return cn(base, innerGlow, "bg-[#1de9b6]/40 dark:bg-[#00c4b4]/45 text-white")

      case "exercice": // bleu
        return cn(base, innerGlow, "bg-sky-700/45 dark:bg-sky-800/50 text-white")

      case "discuss": // violet
        return cn(base, innerGlow, "bg-violet-700/45 dark:bg-violet-800/50 text-white")

      case "deep": // rouge
        return cn(base, innerGlow, "bg-rose-700/50 dark:bg-rose-800/55 text-white")
    }
  } else {
    // ☀️ Couleurs claires harmonisées
    switch (kind) {
      case "cours": // 💚 vert turquoise (texte foncé pour contraste)
        return cn(base, innerGlow, "bg-[#a7ffee]/70 text-[#0b5e4d] border-white/60 shadow-lg")

      case "exercice": // bleu clair
        return cn(base, innerGlow, "bg-sky-300/70 text-[#0b294a] border-white/60 shadow-lg")

      case "discuss": // violet pastel
        return cn(base, innerGlow, "bg-violet-300/70 text-[#2e1b4e] border-white/60 shadow-lg")

      case "deep": // rouge vif
        return cn(base, innerGlow, "bg-rose-400/70 text-[#4a0a0a] border-white/60 shadow-lg")
    }
  }

}

/* -------------------------------------------------------------------------- */
/* 💫 SectionCards : composant principal                                     */
/* -------------------------------------------------------------------------- */

export function SectionCards() {
  const navigate = useNavigate()
  const { courseType, setCourseType } = useCourseType()

  const [isDark, setIsDark] = useState<boolean>(
    typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")
  )

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
      <div className="text-center text-3xl font-bold mb-10">
        <GradientText
          key={courseType}
          className="text-4xl font-bold"
          text="Bienvenu sur Pixia"
          gradient={activeGradient}
        />
      </div>

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
              className={cn(glassTint(c.key, isDark))}
            >
              {/* Reflet interne lumineux */}
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
