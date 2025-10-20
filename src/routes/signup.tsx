import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useMutation } from "~/hooks/useMutation"
import { Auth, type AuthField } from "~/components/Auth"
import { useAppSession } from "~/utils/session"

type SignupSearch = {
  redirect?: string
}

type SignupRequest = {
  email: string
  password: string
  given_name: string
  family_name: string
}

type SignupResponse = {
  google_sub: string
  email: string
  given_name: string
  family_name: string
}

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>): SignupSearch => {
    const redirect = typeof search.redirect === "string" ? search.redirect : undefined
    return { redirect }
  },
  component: SignupComp,
})

function SignupComp() {
  const router = useRouter()
  const { redirect } = Route.useSearch()
  const { setSession } = useAppSession()

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

  const signUpFields: AuthField[] = [
    {
      name: "given_name",
      label: "Prénom",
      placeholder: "Jean",
      autoComplete: "given-name",
      required: true,
    },
    {
      name: "family_name",
      label: "Nom",
      placeholder: "Dupont",
      autoComplete: "family-name",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "jean.dupont@example.com",
      autoComplete: "email",
      required: true,
    },
    {
      name: "password",
      label: "Mot de passe",
      type: "password",
      placeholder: "********",
      autoComplete: "new-password",
      required: true,
    },
  ]

  const signupMutation = useMutation<SignupRequest, SignupResponse>({
    fn: async (data) => {
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      return (await res.json()) as SignupResponse
    },

    onSuccess: async ({ data }) => {
      console.log("Inscription réussie :", data)

      setSession({
        userEmail: data.email,
        userId: data.google_sub,
        givenName: data.given_name,
        familyName: data.family_name,
        googleSub: data.google_sub,
        picture: null,
        locale: null,
        isLoggedIn: true,
      })

      router.navigate({ to: redirect ?? "/chat" })
    },
  })

  const formStatus =
    signupMutation.status === "pending"
      ? "pending"
      : signupMutation.status === "error"
      ? "error"
      : signupMutation.status === "success"
      ? "success"
      : "idle"

  return (
    <Auth
      primaryText="Sign Up"
      fields={signUpFields}
      status={formStatus}
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const givenName = (formData.get("given_name") as string | null)?.trim() ?? ""
        const familyName = (formData.get("family_name") as string | null)?.trim() ?? ""
        signupMutation.mutate({
          email: formData.get("email") as string,
          password: formData.get("password") as string,
          given_name: givenName,
          family_name: familyName,
        })
      }}
      afterSubmit={
        signupMutation.status === "error" ? (
          <div className="text-red-400 text-center drop-shadow-sm">
            Une erreur est survenue lors de l'inscription.
          </div>
        ) : null
      }
    />
  )
}
