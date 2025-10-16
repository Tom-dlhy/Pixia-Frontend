import { createFileRoute } from "@tanstack/react-router"
import { Login } from "~/components/Login"

type LoginSearch = {
  redirect?: string
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    const redirect = typeof search.redirect === "string" ? search.redirect : undefined
    return { redirect }
  },
  component: LoginComp,
})

function LoginComp() {
  return <Login />
}
