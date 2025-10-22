import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"

export type AuthField = {
  name: string
  label: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
  autoComplete?: string
  required?: boolean
}

const defaultFields: AuthField[] = [
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "m@example.com",
    autoComplete: "email",
    required: true,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "********",
    autoComplete: "current-password",
    required: true,
  },
]

export function Auth({
  primaryText,
  secondaryText,
  onSubmit,
  status,
  afterSubmit,
  onTestUser,
  socialSlot,
  onSecondaryAction,
  fields,
}: {
  primaryText?: string
  secondaryText?: string
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  status: "pending" | "idle" | "success" | "error"
  afterSubmit?: React.ReactNode
  onTestUser?: () => void
  socialSlot?: React.ReactNode
  onSecondaryAction?: () => void
  fields?: AuthField[]
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4
                 bg-gradient-to-br from-white/70 to-white/40
                 dark:from-gray-900/80 dark:to-black/90
                 backdrop-blur-3xl transition-all duration-700"
    >
      <Card
        className="relative w-full max-w-sm rounded-3xl border border-white/20 
                   bg-[rgba(255,255,255,0.15)] dark:bg-[rgba(24,24,27,0.45)]
                   backdrop-blur-2xl backdrop-saturate-150
                   shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-300 
                   hover:scale-[1.01] hover:shadow-[0_10px_25px_rgba(0,0,0,0.3)] p-8 space-y-6"
      >
        {/* Effet de lumière interne */}
        <span
          aria-hidden
          className="absolute inset-[-20%] bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_60%)] opacity-50 rounded-[inherit]"
        />

        <h1 className="relative z-10 text-3xl font-bold text-center drop-shadow-sm">
          {primaryText}
        </h1>
        <p className="relative z-10 text-sm text-muted-foreground/80 text-center">
          {primaryText
            ? `Enter your credentials to ${primaryText.toLowerCase()}.`
            : "Enter your credentials."}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(e)
          }}
          className="relative z-10 space-y-4"
        >
          {(fields ?? defaultFields).map((field: AuthField) => (
            <div key={field.name} className="grid gap-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                type={field.type ?? "text"}
                name={field.name}
                id={field.name}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                required={field.required ?? true}
                className="border-white/30 bg-white/30 dark:bg-white/10 backdrop-blur-md
                           focus-visible:ring-2 focus-visible:ring-emerald-400 text-foreground
                           placeholder:text-muted-foreground/70"
              />
            </div>
          ))}

          <div className="flex flex-col gap-2 pt-2">
            {primaryText && (
              <Button
                variant="outline"
                type="submit"
                disabled={status === "pending"}
                className="w-full bg-white/20 dark:bg-white/10 border-white/30
                          text-foreground backdrop-blur-md hover:scale-[1.02] 
                          transition-all duration-300"
              >
                {status === "pending" ? "..." : primaryText}
              </Button>
            )}

            {secondaryText && (
              <Button
                variant="outline"
                type="button"
                disabled={status === "pending"}
                onClick={onSecondaryAction}
                className="w-full bg-white/20 dark:bg-white/10 border-white/30
                          text-foreground backdrop-blur-md hover:scale-[1.02] 
                          transition-all duration-300"
              >
                {status === "pending" ? "..." : secondaryText}
              </Button>
            )}

            {onTestUser && (
              <Button
                variant="outline"
                type="button"
                disabled={status === "pending"}
                onClick={onTestUser}
                className="w-full bg-white/20 dark:bg-white/10 border-white/30
                          text-foreground backdrop-blur-md hover:scale-[1.02] 
                          transition-all duration-300"
              >
                {status === "pending" ? "..." : "Utilisateur Test"}
              </Button>
            )}
          </div>


          {socialSlot ? (
            <div className="relative z-10 space-y-4 pt-2">
              <div className="flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-white/30" />
                <span className="text-xs text-muted-foreground/80">ou</span>
                <div className="h-px flex-1 bg-white/30" />
              </div>
              <div className="flex justify-center">{socialSlot}</div>
            </div>
          ) : null}

          {afterSubmit && (
            <div className="text-sm text-red-500 text-center mt-2">
              {afterSubmit}
            </div>
          )}
        </form>
      </Card>
    </div>
  )
}
