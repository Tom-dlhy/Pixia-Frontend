export type RedirectDestination =
  | { type: "chat-home" }
  | { type: "chat-detail"; chatId: string }
  | null

export function resolveRedirectTarget(target?: string): RedirectDestination {
  if (!target || typeof target !== "string") return null

  if (!target.startsWith("/")) return null

  const [pathname] = target.split("?")

  if (pathname === "/chat") {
    return { type: "chat-home" }
  }

  if (pathname.startsWith("/chat/")) {
    const segments = pathname.split("/").filter(Boolean)
    const chatId = segments[1]
    if (chatId) {
      return { type: "chat-detail", chatId }
    }
  }

  return null
}
