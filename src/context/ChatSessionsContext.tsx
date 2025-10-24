import { createContext, useContext, ReactNode, useState } from "react"

export type ChatSessionType = {
  session_id: string
  title: string
  document_type: string
}

type ChatSessionsContextType = {
  sessions: ChatSessionType[]
  setSessions: (sessions: ChatSessionType[]) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const ChatSessionsContext = createContext<ChatSessionsContextType | undefined>(undefined)

export function ChatSessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSessionType[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const setSessionsDebug = (newSessions: ChatSessionType[]) => {
    console.log(`📊 [ChatSessionsContext] Setting sessions:`, {
      count: newSessions.length,
      sessions: newSessions.map(s => ({
        session_id: s.session_id,
        title: s.title,
        document_type: s.document_type,
      })),
    })
    setSessions(newSessions)
  }

  return (
    <ChatSessionsContext.Provider value={{ sessions, setSessions: setSessionsDebug, isLoading, setIsLoading }}>
      {children}
    </ChatSessionsContext.Provider>
  )
}

export function useChatSessions() {
  const context = useContext(ChatSessionsContext)
  if (!context) {
    throw new Error("useChatSessions must be used within ChatSessionsProvider")
  }
  return context
}
