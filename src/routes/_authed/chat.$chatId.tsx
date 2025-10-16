"use client"

import { createFileRoute } from "@tanstack/react-router"
import ChatHeader from "~/layouts/ChatHeader"
import ContentContainer from "~/layouts/ContentContainer"
import CopiloteContainer from "~/layouts/CopiloteContainer"

export const Route = createFileRoute("/_authed/chat/$chatId")({
  component: ChatQuickView,
})

function ChatQuickView() {
  const { chatId } = Route.useParams()

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <ChatHeader
        title="Session Conversationnelle"
        subtitle={`Discussion #${chatId}`}
        showBackButton
        showActionsMenu
      />

      <div className="flex flex-1 px-10 pb-10 pt-6 gap-6 overflow-hidden">
        <ContentContainer className="flex-[0.7]" />
        <CopiloteContainer className="flex-[0.3]" />
      </div>
    </div>
  )
}
