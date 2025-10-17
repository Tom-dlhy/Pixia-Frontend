import { createContext, useContext, useEffect, useMemo, useState, type JSX, type ReactNode } from "react"
import { jwtDecode } from "jwt-decode"

export type UserSession = {
  userEmail?: string | null
  userId?: number | null
}

type DecodedToken = {
  sub: string
  email?: string
  user_id?: number
  exp?: number
}

type SessionContextValue = {
  session: UserSession
  setSession: React.Dispatch<React.SetStateAction<UserSession>>
}

const defaultSession: UserSession = {
  userEmail: null,
  userId: null,
}

const SessionContext = createContext<SessionContextValue>({
  session: defaultSession,
  setSession: () => undefined,
})

export function SessionProvider({ children }: { children: ReactNode }): JSX.Element {
  const [session, setSession] = useState<UserSession>(defaultSession)

  useEffect(() => {
    if (typeof window === "undefined") return

    const applyToken = () => {
      const token = window.localStorage.getItem("access_token")
      if (!token) {
        setSession(defaultSession)
        return
      }

      try {
        const decoded = jwtDecode<DecodedToken>(token)
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.warn("Token expiré, suppression.")
          window.localStorage.removeItem("access_token")
          setSession(defaultSession)
          return
        }

        setSession({
          userEmail: decoded.email ?? null,
          userId: decoded.user_id ?? null,
        })
      } catch (error) {
        console.error("Erreur lors du décodage du token :", error)
        setSession(defaultSession)
      }
    }

    applyToken()

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "access_token") {
        applyToken()
      }
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener("session:refresh", applyToken)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("session:refresh", applyToken)
    }
  }, [])

  const value = useMemo<SessionContextValue>(() => ({ session, setSession }), [session])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useAppSession() {
  return useContext(SessionContext)
}
