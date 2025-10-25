import type { Dispatch, SetStateAction } from "react"
import { SESSION_PROFILE_STORAGE_KEY, type UserSession } from "./session"

export type StoredProfile = {
  email?: string | null
  userId?: string | number | null
  name?: string | null
  notionToken?: string | null
  study?: string | null
}

export type AuthLikeResult = {
  success: boolean
  email?: string | null
  user_id?: string | number | null
  name?: string | null
  notion_token?: string | null
  study?: string | null
}

export const persistProfile = (profile: StoredProfile) => {
  if (typeof window === "undefined") return
  const hasProfile = Object.values(profile).some(
    (value) => value !== null && value !== undefined,
  )
  if (hasProfile) {
    window.localStorage.setItem(SESSION_PROFILE_STORAGE_KEY, JSON.stringify(profile))
  } else {
    window.localStorage.removeItem(SESSION_PROFILE_STORAGE_KEY)
  }
}

export const applyAuthResult = <T extends AuthLikeResult>(
  result: T,
  setSession: Dispatch<SetStateAction<UserSession>>,
) => {
  if (!result.success) return false

  const profile: StoredProfile = {
    email: result.email ?? null,
    userId: result.user_id ?? null,
    name: result.name ?? null,
    notionToken: result.notion_token ?? null,
    study: result.study ?? null,
  }

  if (typeof window !== "undefined") {
    persistProfile(profile)
    // Note: We don't dispatch session:refresh here because we're directly calling setSession below.
    // This prevents the SessionProvider's storage listener from trying to re-apply the same data,
    // which could cause an infinite update loop.
  }

  setSession((prev) => ({
    userEmail: profile.email ?? prev.userEmail ?? null,
    userId: profile.userId ?? prev.userId ?? null,
    name: profile.name ?? prev.name ?? null,
    notionToken: profile.notionToken ?? prev.notionToken ?? null,
    study: profile.study ?? prev.study ?? null,
    isLoggedIn: true,
  }))

  return true
}
