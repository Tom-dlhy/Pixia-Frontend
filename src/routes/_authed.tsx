import { createFileRoute, redirect } from "@tanstack/react-router"
import { SESSION_PROFILE_STORAGE_KEY } from "~/utils/session"

function buildSearchString(search: unknown): string {
  if (!search || typeof search !== "object") {
    return ""
  }

  const params = new URLSearchParams()

  Object.entries(search as Record<string, unknown>).forEach(([key, value]) => {
    if (value == null) return

    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, String(entry)))
      return
    }

    if (typeof value === "object") {
      params.set(key, JSON.stringify(value))
      return
    }

    params.set(key, String(value))
  })

  const query = params.toString()
  return query ? `?${query}` : ""
}

export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context, location }) => {
    const maybeUser = (context as { user?: unknown } | undefined)?.user
    const hasToken =
      typeof window !== "undefined" && Boolean(window.localStorage.getItem("access_token"))
    const hasStoredProfile =
      typeof window !== "undefined" &&
      Boolean(window.localStorage.getItem(SESSION_PROFILE_STORAGE_KEY))

    if (!maybeUser && !hasToken && !hasStoredProfile) {
      const { pathname, search, hash } = location
      const searchString = buildSearchString(search)
      const hashString = hash ? String(hash) : ""
      const redirectPath = `${pathname ?? ""}${searchString}${hashString}` || "/"
      throw redirect({
        to: "/login",
        search: (prev) => ({
          ...prev,
          redirect: redirectPath,
        }),
      })
    }
  },
})
