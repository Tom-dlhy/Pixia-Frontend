"use client"

import { useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Route } from "~/routes/_authed/chat.$chatId"
import ChatHeader from "~/layouts/ChatHeader"
import CopiloteContainer from "~/layouts/CopiloteContainer"
import BackButton from "~/components/BackButton"
import { ChatActionButton } from "~/components/ChatActionButton"
import { NeonContainer } from "~/layouts/NeonContainer"

export function ChatQuickViewLayout() {
  const navigate = useNavigate()
  const { chatId } = Route.useParams()

  const formattedChatId = useMemo(() => {
    if (!chatId) return "Session"
    if (chatId.startsWith("chat-")) return `Chat ${chatId.split("chat-")[1]}`
    return chatId
  }, [chatId])

  return (
    <div className="flex min-h-dvh w-full overflow-hidden bg-sidebar text-sidebar-foreground">
      <NeonContainer>
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
                  Ici s’affiche le contenu du chat associé à {formattedChatId}.
                </p>
                <p className="mt-6 text-sm text-muted-foreground/80">
                  Session ID : {chatId}
                </p>
              </div>
            </div>

            {/* RIGHT PANEL — Copilote */}
            <div className="flex h-full flex-[0.3] flex-col">
              <CopiloteContainer />
            </div>
          </div>
        </div>
      </NeonContainer>
    </div>
  )
}
