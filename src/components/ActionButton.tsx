"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Button } from "~/components/ui/button"
import { Plus, Trash2, Menu } from "lucide-react"
import { FaCheckCircle } from "react-icons/fa"
import { useCourseType } from "~/context/CourseTypeContext"
import { cn } from "~/lib/utils"

interface ActionButtonProps {
  viewLevel?: "root" | "course" | "chapter"
  onCreateCourse?: () => void
  onAddChapter?: () => void
  onDeleteCourse?: () => void
  onDeleteChapter?: () => void
  onMarkDone?: () => void
}

export default function ActionButton({
  viewLevel = "root",
  onCreateCourse,
  onAddChapter,
  onDeleteCourse,
  onDeleteChapter,
  onMarkDone,
}: ActionButtonProps) {
  const { courseType } = useCourseType()

  // Palette d’accents cohérente et adaptative au thème
  const accentMap: Record<
    string,
    {
      light: string
      dark: string
      lightHover: string
      darkHover: string
    }
  > = {
    none: {
      light: "rgba(229,231,235,0.3)",
      dark: "rgba(82,82,91,0.25)",
      lightHover: "rgba(209,213,219,0.45)",
      darkHover: "rgba(113,113,122,0.35)",
    },
    cours: {
      light: "rgba(167,243,208,0.25)",
      dark: "rgba(16,185,129,0.25)",
      lightHover: "rgba(110,231,183,0.35)",
      darkHover: "rgba(5,150,105,0.35)",
    },
    exercice: {
      light: "rgba(147,197,253,0.25)",
      dark: "rgba(56,189,248,0.25)",
      lightHover: "rgba(96,165,250,0.35)",
      darkHover: "rgba(14,165,233,0.35)",
    },
    discuss: {
      light: "rgba(216,180,254,0.25)",
      dark: "rgba(139,92,246,0.25)",
      lightHover: "rgba(192,132,252,0.35)",
      darkHover: "rgba(124,58,237,0.35)",
    },
    deep: {
      light: "rgba(203,213,225,0.25)",
      dark: "rgba(71,85,105,0.25)",
      lightHover: "rgba(148,163,184,0.35)",
      darkHover: "rgba(51,65,85,0.35)",
    },
  }

  const accent = accentMap[courseType] ?? accentMap["none"]

  /* -------------------- 1️⃣ Vue racine -------------------- */
  if (viewLevel === "root" && onCreateCourse) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={onCreateCourse}
        className={cn(
          "flex items-center gap-2 rounded-md cursor-pointer transition-all duration-300 text-foreground",
          "border border-white/30 dark:border-white/10 backdrop-blur-md backdrop-saturate-150",
          "bg-[rgba(255,255,255,0.25)] dark:bg-[rgba(24,24,27,0.35)]",
          "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.1)] hover:scale-[1.03]"
        )}
        style={{
          background: `linear-gradient(135deg, ${accent.light}, transparent 80%)`,
        }}
      >
        <Plus className="h-4 w-4 opacity-90" />
      </Button>
    )
  }

  /* -------------------- 2️⃣ Vue d’un cours -------------------- */
  if (viewLevel === "course") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className={cn(
              "flex items-center gap-2 rounded-md cursor-pointer transition-all duration-300 text-foreground",
              "border border-white/30 dark:border-white/10 backdrop-blur-md backdrop-saturate-150",
              "bg-[rgba(255,255,255,0.25)] dark:bg-[rgba(24,24,27,0.35)]",
              "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.1)] hover:scale-[1.03]"
            )}
            style={{
              background: `linear-gradient(135deg, ${accent.light}, transparent 80%)`,
            }}
          >
            <Menu className="h-4 w-4 opacity-90" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className={cn(
            "min-w-56 rounded-xl border border-white/20 dark:border-white/10 p-2",
            "backdrop-blur-xl backdrop-saturate-150",
            "bg-[rgba(255,255,255,0.2)] dark:bg-[rgba(24,24,27,0.4)]",
            "shadow-[inset_0_1px_3px_rgba(255,255,255,0.2),0_8px_30px_rgba(0,0,0,0.25)]"
          )}
          side="bottom"
          align="end"
          sideOffset={8}
        >
          {/* ---------- Ajouter un chapitre ---------- */}
          {onAddChapter && (
            <Button
              variant="ghost"
              onClick={onAddChapter}
              className={cn(
                "relative w-full justify-start gap-2 rounded-md transition-all duration-300 text-green-600 dark:text-green-400",
                "hover:scale-[1.02]",
                "before:absolute before:inset-0 before:rounded-md before:opacity-0 before:-z-10 before:transition-opacity before:duration-300",
                "hover:before:opacity-100"
              )}
              style={{
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${
                  document.documentElement.classList.contains("dark")
                    ? accent.darkHover
                    : accent.lightHover
                }, ${
                  document.documentElement.classList.contains("dark")
                    ? "rgba(5,150,105,0.3)"
                    : "rgba(134,239,172,0.3)"
                })`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
              }}
            >
              <Plus className="h-4 w-4 opacity-80" />
              Ajouter un chapitre
            </Button>
          )}

          {/* ---------- Supprimer le cours ---------- */}
          {onDeleteCourse && (
            <>
              <DropdownMenuSeparator className="my-1 opacity-20" />
              <Button
                variant="ghost"
                onClick={onDeleteCourse}
                className={cn(
                  "relative w-full justify-start gap-2 rounded-md transition-all duration-300 text-red-600 dark:text-red-400",
                  "hover:scale-[1.02]"
                )}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${
                    document.documentElement.classList.contains("dark")
                      ? "rgba(239,68,68,0.3)"
                      : "rgba(252,165,165,0.3)"
                  }, ${
                    document.documentElement.classList.contains("dark")
                      ? "rgba(127,29,29,0.3)"
                      : "rgba(248,113,113,0.3)"
                  })`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                }}
              >
                <Trash2 className="h-4 w-4 opacity-80" />
                Supprimer le cours
              </Button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  /* -------------------- 3️⃣ Vue d’un chapitre -------------------- */
  if (viewLevel === "chapter") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className={cn(
              "flex items-center gap-2 rounded-md cursor-pointer transition-all duration-300 text-foreground",
              "border border-white/30 dark:border-white/10 backdrop-blur-md backdrop-saturate-150",
              "bg-[rgba(255,255,255,0.25)] dark:bg-[rgba(24,24,27,0.35)]",
              "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.1)] hover:scale-[1.03]"
            )}
            style={{
              background: `linear-gradient(135deg, ${accent.light}, transparent 80%)`,
            }}
          >
            <Menu className="h-4 w-4 opacity-90" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className={cn(
            "min-w-56 rounded-xl border border-white/20 dark:border-white/10 p-2",
            "backdrop-blur-xl backdrop-saturate-150",
            "bg-[rgba(255,255,255,0.2)] dark:bg-[rgba(24,24,27,0.4)]",
            "shadow-[inset_0_1px_3px_rgba(255,255,255,0.2),0_8px_30px_rgba(0,0,0,0.25)]"
          )}
          side="bottom"
          align="end"
          sideOffset={8}
        >
          {/* ---------- Marquer terminé ---------- */}
          {onMarkDone && (
            <Button
              variant="ghost"
              onClick={onMarkDone}
              className={cn(
                "w-full justify-start gap-2 rounded-md transition-all duration-300 text-green-600 dark:text-green-400",
                "hover:scale-[1.02]"
              )}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${
                  document.documentElement.classList.contains("dark")
                    ? "rgba(34,197,94,0.25)"
                    : "rgba(110,231,183,0.25)"
                }, ${
                  document.documentElement.classList.contains("dark")
                    ? "rgba(5,150,105,0.25)"
                    : "rgba(74,222,128,0.25)"
                })`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
              }}
            >
              <FaCheckCircle className="h-4 w-4 opacity-80" />
              Marquer comme terminé
            </Button>
          )}

          {/* ---------- Supprimer chapitre ---------- */}
          {onDeleteChapter && (
            <>
              <DropdownMenuSeparator className="my-1 opacity-20" />
              <Button
                variant="ghost"
                onClick={onDeleteChapter}
                className={cn(
                  "w-full justify-start gap-2 rounded-md transition-all duration-300 text-red-600 dark:text-red-400",
                  "hover:scale-[1.02]"
                )}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${
                    document.documentElement.classList.contains("dark")
                      ? "rgba(239,68,68,0.3)"
                      : "rgba(252,165,165,0.3)"
                  }, ${
                    document.documentElement.classList.contains("dark")
                      ? "rgba(127,29,29,0.3)"
                      : "rgba(248,113,113,0.3)"
                  })`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                }}
              >
                <Trash2 className="h-4 w-4 opacity-80" />
                Supprimer le chapitre
              </Button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return null
}
