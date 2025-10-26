"use client"

import * as React from "react"
import { Sun, Moon } from "lucide-react"
import { cn } from "~/lib/utils"

const STORAGE_KEY = "theme"
type Theme = "light" | "dark"

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"
  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null
  if (stored === "dark" || stored === "light") return stored
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function setDocumentTheme(theme: Theme) {
  const root = window.document.documentElement
  root.classList.toggle("dark", theme === "dark")
  window.localStorage.setItem(STORAGE_KEY, theme)
}

export function ThemeSwitch({ className }: { className?: string }) {
  const [theme, setTheme] = React.useState<Theme>(getInitialTheme)
  const isDark = theme === "dark"

  React.useEffect(() => {
    if (typeof window === "undefined") return
    setDocumentTheme(theme)
  }, [theme])

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }, [])

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      aria-label="Basculer le mode sombre"
      className={cn(
        "relative inline-flex h-7 w-12 items-center rounded-full p-[2px] transition-all duration-300",
        "border border-white/20 dark:border-white/10",
        "bg-[rgba(255,255,255,0.25)] dark:bg-[rgba(24,24,27,0.4)]",
        "backdrop-blur-xl backdrop-saturate-150",
        "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.1)]",
        "hover:scale-[1.05] hover:shadow-[inset_0_1px_4px_rgba(255,255,255,0.6),0_6px_18px_rgba(0,0,0,0.15)]",
        "transition-transform ease-out",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-opacity duration-300 blur-[8px]",
          isDark
            ? "bg-[radial-gradient(circle_at_30%_70%,rgba(120,120,255,0.25),transparent)]"
            : "bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.4),transparent)]"
        )}
      />

      <span
        className={cn(
          "relative z-10 flex h-5 w-5 items-center justify-center rounded-full shadow-md transition-transform duration-300",
          "bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(255,255,255,0.15)]",
          "backdrop-blur-sm",
          isDark ? "translate-x-5" : "translate-x-0"
        )}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-white opacity-90" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-yellow-500 opacity-90" />
        )}
      </span>
    </button>
  )
}
