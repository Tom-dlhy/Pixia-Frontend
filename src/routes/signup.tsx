import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useMutation } from "~/hooks/useMutation"
import { Auth, type AuthField } from "~/components/Auth"
import { useAppSession } from "~/utils/session"
import { signupUser } from "~/server/signup.server"

type SignupSearch = {
  redirect?: string
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

  const signupMutation = useMutation({
    fn: signupUser,
    onSuccess: async ({ data }) => {
      if (!data.success) {
        throw new Error(data.error)
      }

      console.log("Inscription réussie :", data)

      setSession({
        userEmail: data.email,
        userId: data.user_id,
        givenName: data.given_name,
        familyName: data.family_name,
        googleSub: data.user_id,
        picture: null,
        locale: null,
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
        
        signupMutation.mutate({
          data: {
            email: (formData.get("email") as string).trim(),
            password: formData.get("password") as string,
            given_name: (formData.get("given_name") as string).trim() || undefined,
            family_name: (formData.get("family_name") as string).trim() || undefined,
          },
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
