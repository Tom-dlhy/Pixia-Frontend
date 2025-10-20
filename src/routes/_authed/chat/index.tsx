"use client"

import { createFileRoute } from "@tanstack/react-router"
import { ChatQuickViewLayout } from "~/layouts/ChatQuickViewLayout"

export const Route = createFileRoute("/_authed/chat/")({
  component: ChatPage,
})

function ChatPage() {
  return (
      <div></div>
  )
}
