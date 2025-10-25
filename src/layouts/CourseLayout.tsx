"use client"

import React, { useState } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowLeft, Menu } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useCourseType } from "~/context/CourseTypeContext"
import { getCourseAccent } from "~/utils/courseTypeStyles"
import { DocPanel } from "~/components/DocPanel"
import { Chat } from "~/components/Chat"

export function CourseLayout({ children }: { children: React.ReactNode }) {
  const { courseType } = useCourseType()
  const accent = getCourseAccent(courseType)
  const [copilotOpen, setCopilotOpen] = useState(true)

  return (
    <div className="flex min-h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      <header
        className="flex items-center justify-between border-b border-border/40 px-6 py-4 text-lg font-semibold shadow-sm"
        style={{
          background: accent.gradient,
          boxShadow: accent.glow,
        }}
      >
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full border border-border/40 bg-background/90 shadow-sm backdrop-blur"
          >
            <Link to="/chat">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Retour</span>
            </Link>
          </Button>
          <span>
            {courseType === "cours"
              ? "Session de Cours Rapide"
              : courseType === "exercice"
              ? "Session d'Exercices rapide"
              : `Session de ${courseType}`}
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-background px-10 py-8">
          <DocPanel />
          {children}
        </div>

        <aside
          className={`flex flex-col border-l border-border/40 bg-background/60 backdrop-blur-sm transition-all duration-300 ease-in-out ${copilotOpen ? "w-[350px]" : "w-16"}`}
        >
          <div className="border-b border-border/40 px-4 py-3">
            {copilotOpen ? (
              <div className="flex items-center justify-between">
                <h3
                  className="font-semibold text-foreground"
                  style={{ color: accent.accent }}
                >
                  Copilote
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCopilotOpen(!copilotOpen)}
                  className="rounded-full border border-border/40 bg-background/90 shadow-sm backdrop-blur"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCopilotOpen(true)}
                className="rounded-full border border-border/40 bg-background/90 shadow-sm backdrop-blur"
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Déplier le copilote</span>
              </Button>
            )}
          </div>

          {copilotOpen && (
            <div className="flex-1 overflow-y-auto px-6 py-4 text-sm text-muted-foreground">
              <p>Des suggestions contextuelles apparaîtront ici.</p>
            </div>
          )}

          {copilotOpen && (
            <div className="border-t border-border/40 bg-background/80 px-4 py-3 backdrop-blur">
              <Chat />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
