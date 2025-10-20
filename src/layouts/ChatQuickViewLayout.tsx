"use client"

import { useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import ChatHeader from "~/layouts/ChatHeader"
import CopiloteContainer from "~/layouts/CopiloteContainer"
import BackButton from "~/components/BackButton"
import { ChatActionButton } from "~/components/ChatActionButton"

export function ChatQuickViewLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  // 🔹 Récupération de la session stockée localement (ou valeur par défaut)
  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "Session"
    const stored = sessionStorage.getItem("chatSession")
    return stored || "Session"
  }, [])

  // 🔹 Format d’affichage convivial
  const formattedSession = useMemo(() => {
    if (sessionId.startsWith("chat-")) return `Chat ${sessionId.split("chat-")[1]}`
    return sessionId
  }, [sessionId])

  return (
    <div className="flex min-h-dvh w-full overflow-hidden bg-sidebar text-sidebar-foreground">
      <div className="flex min-h-full w-full flex-col overflow-hidden bg-background">
        {/* HEADER */}
        <div className="flex-none px-10 pt-10">
          <ChatHeader
            title="Session Conversationnelle"
            leftAction={<BackButton onClick={() => navigate({ to: "/chat" })} />}
            rightAction={<ChatActionButton />}
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex flex-1 gap-6 overflow-hidden px-10 pb-10 pt-6">
          {/* LEFT PANEL — Conversation Area */}
          <div
            className="
              flex flex-[0.7] flex-col justify-between overflow-y-auto
              rounded-[28px] border border-white/20 dark:border-white/10
              bg-[rgba(255,255,255,0.15)] dark:bg-[rgba(24,24,27,0.45)]
              backdrop-blur-xl backdrop-saturate-150
              shadow-[inset_0_1px_3px_rgba(255,255,255,0.3),0_12px_40px_rgba(0,0,0,0.25)]
              transition-all duration-300 p-6
            "
          >
            <div>
              <h3 className="text-lg font-semibold">Zone de conversation</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Ici s’affiche le contenu de la session active.
              </p>
              <p className="mt-6 text-sm text-muted-foreground/80">
                Session ID : {formattedSession}
              </p>

              {/* ✅ Contenu injecté dynamiquement */}
              <div className="mt-6">{children}</div>
            </div>
          </div>

          {/* RIGHT PANEL — Copilote */}
          <div className="flex h-full flex-[0.3] flex-col">
            <CopiloteContainer />
          </div>
        </div>
      </div>
    </div>
  )
}
