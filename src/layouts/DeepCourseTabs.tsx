"use client"

import { cva } from "class-variance-authority"
import { cn } from "~/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { DeepCoursesTab } from "~/layouts/DeepCourseContext"

interface DeepCourseTabsProps {
  activeTab: DeepCoursesTab
  onChange: (tab: DeepCoursesTab) => void
}

export default function DeepCourseTabs({ activeTab, onChange }: DeepCourseTabsProps) {
  const tabs: DeepCoursesTab[] = ["cours", "exercice", "evaluation"]

  const accentMap: Record<DeepCoursesTab, { light: string; dark: string }> = {
    cours: {
      light: "rgba(167,243,208,0.25)",
      dark: "rgba(16,185,129,0.25)",
    },
    exercice: {
      light: "rgba(147,197,253,0.25)",
      dark: "rgba(56,189,248,0.25)",
    },
    evaluation: {
      light: "rgba(252,165,165,0.25)",
      dark: "rgba(239,68,68,0.25)",
    },
  }

  const tabTriggerVariants = cva(
    "relative rounded-md px-5 py-2 text-sm font-medium capitalize text-foreground transition-all duration-300 border border-white/20 backdrop-blur-md backdrop-saturate-150 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_2px_10px_rgba(0,0,0,0.15)] hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2",
    {
      variants: {
        active: {
          true: "",
          false: "",
        },
      },
      defaultVariants: {
        active: false,
      },
    }
  )

  return (
    <Tabs value={activeTab} onValueChange={(v) => onChange(v as DeepCoursesTab)}>
      <TabsList
        aria-label="Navigation des cours"
        className="flex items-center justify-center gap-3 bg-transparent"
      >
        {tabs.map((tab) => {
          const accent = accentMap[tab]

          return (
            <TabsTrigger
              key={tab}
              value={tab}
              className={cn(tabTriggerVariants({ active: activeTab === tab }))}
              style={{
                background:
                  activeTab === tab
                    ? `linear-gradient(135deg, ${accent.light}, ${accent.dark})`
                    : `rgba(255,255,255,0.12)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${accent.light}, ${accent.dark})`
                e.currentTarget.style.backdropFilter = "blur(16px) saturate(150%)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  activeTab === tab
                    ? `linear-gradient(135deg, ${accent.light}, ${accent.dark})`
                    : `rgba(255,255,255,0.12)`
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
  )
}
