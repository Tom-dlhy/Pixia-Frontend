"use client"

import { useState, useEffect } from "react"
import { cva } from "class-variance-authority"
import { cn } from "~/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { DeepCoursesTab } from "~/layouts/DeepCourseContext"
import { EvaluationDurationDrawerButtons, EvaluationDurationDrawerSlider } from "~/components/EvaluationDurationDrawer"

export default function DeepCourseTabs({
  activeTab,
  onChange,
  onDrawerToggle,
  onEvaluationStateChange, // 🔹 nouveau callback
}: {
  activeTab: DeepCoursesTab
  onChange: (tab: DeepCoursesTab) => void
  onDrawerToggle?: (open: boolean) => void
  onEvaluationStateChange?: (isEvaluating: boolean) => void
}) {
  const tabs: DeepCoursesTab[] = ["cours", "exercice", "evaluation"]
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [timer, setTimer] = useState<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)

// --- Décrémentation automatique du timer ---
useEffect(() => {
  if (!isRunning || timer === null) return

  if (timer <= 0) {
    setIsRunning(false)
    setTimer(null) // ✅ cache le timer
    onEvaluationStateChange?.(false)
    onChange("cours") // ✅ revient sur "cours"
    return
  }

  const interval = setInterval(() => {
    setTimer((prev) => (prev !== null ? prev - 1 : null))
  }, 1000)

  return () => clearInterval(interval)
}, [isRunning, timer])


  // --- Gestion du drawer ---
  const handleDrawerChange = (open: boolean) => {
    setDrawerOpen(open)
    onDrawerToggle?.(open)

    // Si le drawer se ferme (clic en dehors ou annulation)
    if (!open) onChange("cours")
  }

  const accentMap: Record<
    "cours" | "exercice" | "evaluation",
    { light: string; dark: string }
  > = {
    cours: {
      light: "rgba(94, 241, 194, 0.25)",
      dark: "rgba(29, 233, 182, 0.25)",
    },
    exercice: {
      light: "rgba(147, 197, 253, 0.25)",
      dark: "rgba(59, 130, 246, 0.25)",
    },
    evaluation: {
      light: "rgba(253, 164, 175, 0.25)",
      dark: "rgba(244, 63, 94, 0.25)",
    },
  }

  const tabTriggerVariants = cva(
    "relative rounded-md px-5 py-2 text-sm font-medium capitalize text-foreground transition-all duration-300 border border-white/20 backdrop-blur-md backdrop-saturate-150 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_2px_10px_rgba(0,0,0,0.15)] hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2",
    {
      variants: {
        active: {
          true: "scale-[1.03] text-white shadow-lg",
          false:
            "bg-transparent text-foreground/80 hover:bg-accent hover:text-accent-foreground",
        },
      },
      defaultVariants: {
        active: false,
      },
    }
  )

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  return (
    <>
      {/* --- Conteneur principal avec blur quand drawer ouvert --- */}
      <div
        className={cn(
          "relative flex items-center justify-center w-full transition-all duration-500",
          drawerOpen && "blur-md brightness-75 pointer-events-none"
        )}
      >
        {/* --- Tabs centrés --- */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => onChange(v as DeepCoursesTab)}
        >
          <TabsList
            aria-label="Navigation des cours"
            className="flex items-center justify-center gap-3 bg-transparent"
          >
            {tabs.map((tab) => {
              const accent = accentMap[tab]
              const isActive = activeTab === tab

              const handleClick = () => {
                // 🔒 Empêche l’ouverture du drawer s’il y a un timer en cours
                if (tab === "evaluation") {
                  if (isRunning && timer && timer > 0) return
                  handleDrawerChange(true)
                } else {
                  onChange(tab)
                }
              }

              return (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className={cn(tabTriggerVariants({ active: isActive }))}
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(135deg, ${accent.light}, ${accent.dark})`,
                        }
                      : undefined
                  }
                  onClick={handleClick}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${accent.light}, ${accent.dark})`
                    e.currentTarget.style.backdropFilter =
                      "blur(16px) saturate(150%)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isActive
                      ? `linear-gradient(135deg, ${accent.light}, ${accent.dark})`
                      : "transparent"
                    e.currentTarget.style.backdropFilter =
                      "blur(10px) saturate(100%)"
                  }}
                >
                  {tab}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>

        {/* --- Timer positionné à droite --- */}
        {timer !== null && (
          <div
            className={cn(
              "absolute right-0 text-sm font-semibold px-4 py-1.5 rounded-xl min-w-[80px] text-center select-none",
              "backdrop-blur-md backdrop-saturate-150 border transition-all duration-700 ease-in-out shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_2px_6px_rgba(0,0,0,0.15)]",
              timer <= 300
                ? "text-white border-red-400/30 bg-[rgba(244,63,94,0.25)]"
                : "text-white/90 border-white/20 bg-[rgba(255,255,255,0.08)]"
            )}
            style={{
              backdropFilter: "blur(16px) saturate(180%)",
              WebkitBackdropFilter: "blur(16px) saturate(180%)",
            }}
          >
            {formatTime(timer)}
          </div>
        )}
      </div>

      {/* --- Drawer d’évaluation --- */}
      <EvaluationDurationDrawerButtons
        open={drawerOpen}
        onOpenChange={handleDrawerChange}
        onConfirm={(duration) => {
          console.log("Durée choisie :", duration)
          setTimer(duration * 60)
          setIsRunning(true)
          onChange("evaluation")
          onEvaluationStateChange?.(true) // 🔹 lancement de l’évaluation
        }}
        onCancel={() => {
          handleDrawerChange(false)
          onChange("cours")
        }}
      />
    </>
  )
}
