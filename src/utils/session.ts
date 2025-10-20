import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactElement,
  type ReactNode,
  type SetStateAction,
} from "react"
import { jwtDecode } from "jwt-decode"

export type UserSession = {
  userEmail?: string | null
  userId?: string | number | null
  givenName?: string | null
  familyName?: string | null
  picture?: string | null
  locale?: string | null
  googleSub?: string | null
  isLoggedIn?: boolean
}

type DecodedToken = {
  sub: string
  email?: string
  user_id?: number | string
  exp?: number
}

type SessionContextValue = {
  session: UserSession
  setSession: Dispatch<SetStateAction<UserSession>>
}

const defaultSession: UserSession = {
  userEmail: null,
  userId: null,
  givenName: null,
  familyName: null,
  picture: null,
  locale: null,
  googleSub: null,
  isLoggedIn: false,
}

export const SESSION_PROFILE_STORAGE_KEY = "session_user"

type StoredProfile = {
  email?: string | null
  userId?: string | number | null
  givenName?: string | null
  familyName?: string | null
  picture?: string | null
  locale?: string | null
  googleSub?: string | null
}

const SessionContext = createContext<SessionContextValue>({
  session: defaultSession,
  setSession: () => undefined,
})

function readStoredProfile(): StoredProfile | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(SESSION_PROFILE_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredProfile
  } catch (error) {
    console.error("Erreur lors de la lecture du profil en session :", error)
    return null
  }
}

export function SessionProvider({ children }: { children: ReactNode }): ReactElement {
  const [session, setSession] = useState<UserSession>(defaultSession)

  useEffect(() => {
    if (typeof window === "undefined") return

    const applyToken = () => {
      const token = window.localStorage.getItem("access_token")
      const profile = readStoredProfile()

      if (!token) {
        if (profile) {
          setSession({
            userEmail: profile.email ?? null,
            userId: profile.userId ?? null,
            givenName: profile.givenName ?? null,
            familyName: profile.familyName ?? null,
            picture: profile.picture ?? null,
            locale: profile.locale ?? null,
            googleSub: profile.googleSub ?? null,
            isLoggedIn: true,
          })
        } else {
          setSession(defaultSession)
        }
        return
      }

      try {
        const decoded = jwtDecode<DecodedToken>(token)
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          window.localStorage.removeItem("access_token")
          window.localStorage.removeItem(SESSION_PROFILE_STORAGE_KEY)
          setSession(defaultSession)
          return
        }

        setSession({
          userEmail: decoded.email ?? decoded.sub ?? profile?.email ?? null,
          userId: profile?.userId ?? decoded.user_id ?? null,
          givenName: profile?.givenName ?? null,
          familyName: profile?.familyName ?? null,
          picture: profile?.picture ?? null,
          locale: profile?.locale ?? null,
          googleSub: profile?.googleSub ?? null,
          isLoggedIn: true,
        })
      } catch (error) {
        console.error("Erreur lors du décodage du token :", error)
        window.localStorage.removeItem("access_token")
        window.localStorage.removeItem(SESSION_PROFILE_STORAGE_KEY)
        setSession(defaultSession)
      }
    }

    applyToken()

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "access_token" || event.key === SESSION_PROFILE_STORAGE_KEY) {
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

  useEffect(() => {
    if (typeof window === "undefined") return

    const { userEmail, userId, givenName, familyName, picture, locale, googleSub, isLoggedIn } =
      session
    const hasProfile = Boolean(
      userEmail ||
        (userId !== null && userId !== undefined) ||
        givenName ||
        familyName ||
        picture ||
        locale ||
        googleSub,
    )

    if (!hasProfile || !isLoggedIn) {
      window.localStorage.removeItem(SESSION_PROFILE_STORAGE_KEY)
      return
    }

    try {
      window.localStorage.setItem(
        SESSION_PROFILE_STORAGE_KEY,
        JSON.stringify({
          email: userEmail ?? null,
          userId: userId ?? null,
          givenName: givenName ?? null,
          familyName: familyName ?? null,
          picture: picture ?? null,
          locale: locale ?? null,
          googleSub: googleSub ?? null,
        }),
      )
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du profil en session :", error)
    }
  }, [session])

  const value = useMemo<SessionContextValue>(() => ({ session, setSession }), [session])

  return createElement(SessionContext.Provider, { value }, children)
}

export function useAppSession() {
  return useContext(SessionContext)
}
