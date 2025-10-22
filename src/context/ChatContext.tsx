"use client"

import { createContext, useContext, useState } from "react"

type ChatContextType = {
  sessionId: string | null
  setSessionId: (id: string | null) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null)

  return (
    <ChatContext.Provider value={{ sessionId, setSessionId }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>")
  return ctx
}
