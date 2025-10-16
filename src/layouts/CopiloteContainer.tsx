"use client"

import { useState, useCallback, useMemo, type CSSProperties } from "react"
import { ChatInput } from "~/components/ChatInput"
import { useCourseType } from "~/context/CourseTypeContext"
import { getCourseAccent } from "~/utils/courseTypeStyles"
import { cn } from "~/lib/utils"

interface CopiloteContainerProps {
  className?: string
}

/**
 * Right-side assistant panel with dynamic glassmorphism & accent gradient.
 */
export default function CopiloteContainer({ className = "" }: CopiloteContainerProps) {
  const [prompt, setPrompt] = useState("")
  const { courseType } = useCourseType()
  const accent = useMemo(() => getCourseAccent(courseType === "deep" ? "none" : courseType), [courseType])

  // Animated gradient title
  const headingStyle = useMemo(
    () =>
      ({
        backgroundImage: accent.gradient,
        backgroundSize: "300% 300%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
        animation: "neon-flow 12s linear infinite",
      }) as CSSProperties,
    [accent]
  )

  const handleSubmit = useCallback(() => {
    if (!prompt.trim()) return
    console.info("Copilote prompt:", prompt)
    setPrompt("")
  }, [prompt])

  return (
    <aside
      className={cn(
        `
        hidden md:flex flex-1 flex-col
        rounded-[28px] border 
        backdrop-blur-[22px] backdrop-saturate-150
        bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.05))]
        dark:bg-[linear-gradient(135deg,rgba(24,24,27,0.35),rgba(39,39,42,0.25))]
        border-white/30 dark:border-white/10
        shadow-[inset_0_1px_3px_rgba(255,255,255,0.2),0_8px_30px_rgba(0,0,0,0.25)]
        transition-all duration-500 ease-out
        hover:shadow-[inset_0_1px_6px_rgba(255,255,255,0.25),0_12px_40px_rgba(0,0,0,0.35)]
        p-6
      `,
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
        <div>
          <h2 className="text-lg font-semibold" style={headingStyle}>
            Copilote
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Retrouvez ici les recommandations et les ressources contextuelles liées à votre contenu.
          </p>
        </div>

        {/* Content blocks */}
        <div className="flex flex-col gap-3 text-sm">
          <div className="rounded-2xl border border-white/20 dark:border-white/10 bg-white/5 dark:bg-white/5 p-3 backdrop-blur-md">
            Suggestions personnalisées
          </div>
          <div className="rounded-2xl border border-white/20 dark:border-white/10 bg-white/5 dark:bg-white/5 p-3 backdrop-blur-md">
            Historique des interactions
          </div>
        </div>
      </div>

      {/* Chat input */}
      <ChatInput
        value={prompt}
        onChange={setPrompt}
        onSubmit={handleSubmit}
        disableAttachments={false}
        isSending={false}
        className="mt-auto"
        placeholder="Demandez une assistance au copilote..."
      />
    </aside>
  )
}
