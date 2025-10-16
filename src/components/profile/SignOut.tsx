"use client"

import { LogOut } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useRouter } from "@tanstack/react-router"
import { cn } from "~/lib/utils"

export function SignOut() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      onClick={() => router.navigate({ to: "/logout" })}
      className={cn(
        "relative w-full justify-start gap-2 rounded-md transition-all duration-300 text-red-600 dark:text-red-400",
        "hover:scale-[1.02]"
      )}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${
          document.documentElement.classList.contains("dark")
            ? "rgba(239,68,68,0.3)" // rouge doux (dark mode)
            : "rgba(252,165,165,0.3)" // rouge clair (light mode)
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
      <LogOut className="h-4 w-4 opacity-80" />
      Se déconnecter
    </Button>
  )
}
