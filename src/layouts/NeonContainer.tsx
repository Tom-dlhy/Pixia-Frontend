"use client"

import React, { useMemo } from "react"
import { useCourseType } from "~/context/CourseTypeContext"
import { getCourseAccent } from "~/utils/courseTypeStyles"

export function NeonContainer({ children }: { children: React.ReactNode }) {
  const { courseType } = useCourseType()
  const accent = getCourseAccent(courseType)

  const neonLayoutStyle = useMemo(
    () =>
      ({
        "--neon-gradient": accent.gradient,
        "--neon-glow": accent.glow,
        "--neon-surface": "hsl(var(--background) / 0.94)",
        "--neon-border-width": "1.5px",
        "--neon-radius": "0px",
      }) as React.CSSProperties,
    [accent],
  )

  return (
    <div className="neon-motion-border flex h-full w-full" style={neonLayoutStyle}>
      <div className="neon-motion-border__inner flex h-full w-full">
        <div className="neon-motion-border__core flex h-full w-full bg-transparent overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
