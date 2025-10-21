import type { Dispatch, SetStateAction } from "react"
import { SESSION_PROFILE_STORAGE_KEY, type UserSession } from "./session"

export type StoredProfile = {
  email?: string | null
  userId?: string | number | null
  givenName?: string | null
  familyName?: string | null
}

export type AuthLikeResult = {
  success: boolean
  email?: string | null
  user_id?: string | number | null
  given_name?: string | null
  family_name?: string | null
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
    givenName: result.given_name ?? null,
    familyName: result.family_name ?? null,
  }

  if (typeof window !== "undefined") {
    persistProfile(profile)
    window.dispatchEvent(new Event("session:refresh"))
  }

  setSession((prev) => ({
    userEmail: profile.email ?? prev.userEmail ?? null,
    userId: profile.userId ?? prev.userId ?? null,
    givenName: profile.givenName ?? prev.givenName ?? null,
    familyName: profile.familyName ?? prev.familyName ?? null,
    isLoggedIn: true,
  }))

  return true
}
