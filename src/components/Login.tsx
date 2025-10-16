import { useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "../hooks/useMutation"
import { loginFn } from "../routes/_authed"
import { Auth } from "./Auth"
import { signupFn } from "~/routes/signup"
import { Route as LoginRoute } from "~/routes/login"

export function Login() {
  const router = useRouter()
  const { redirect: redirectTarget } = LoginRoute.useSearch()

  const loginMutation = useMutation({
    fn: loginFn,
    onSuccess: async (ctx) => {
      if (!ctx.data?.error) {
        await router.invalidate()
        const destination = resolveRedirectTarget(redirectTarget)

        if (destination?.type === "chat-detail") {
          router.navigate({
            to: "/chat/$chatId",
            params: { chatId: destination.chatId },
          })
        } else if (destination?.type === "chat-home") {
          router.navigate({ to: "/chat" })
        } else {
          router.navigate({ to: "/chat" })
        }
        return
      }
    },
  })

  const signupMutation = useMutation({
    fn: useServerFn(signupFn),
  })

  return (
  <Auth
    actionText="Login"
    status={loginMutation.status}
    onSubmit={(e) => {
      const formData = new FormData(e.target as HTMLFormElement)

      loginMutation.mutate({
        data: {
          email: formData.get("email") as string,
          password: formData.get("password") as string,
        },
      })
    }}
    afterSubmit={
      loginMutation.data ? (
        <>
          <div className="text-red-400 text-center drop-shadow-sm">
            {loginMutation.data.message}
          </div>
          {loginMutation.data.userNotFound ? (
            <div className="text-center">
              <button
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
                onClick={(e) => {
                  const formData = new FormData(
                    (e.target as HTMLButtonElement).form!,
                  )

                  signupMutation.mutate({
                    data: {
                      email: formData.get("email") as string,
                      password: formData.get("password") as string,
                    },
                  })
                }}
                type="button"
              >
                Sign up instead?
              </button>
            </div>
          ) : null}
        </>
      ) : null
    }
  />
)

}

type RedirectDestination =
  | { type: "chat-home" }
  | { type: "chat-detail"; chatId: string }
  | null

function resolveRedirectTarget(target?: string): RedirectDestination {
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
