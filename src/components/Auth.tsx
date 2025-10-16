import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"

export function Auth({
  actionText,
  onSubmit,
  status,
  afterSubmit,
}: {
  actionText: string
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  status: "pending" | "idle" | "success" | "error"
  afterSubmit?: React.ReactNode
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
          {actionText}
        </h1>
        <p className="relative z-10 text-sm text-muted-foreground/80 text-center">
          Enter your credentials to {actionText.toLowerCase()}.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(e)
          }}
          className="relative z-10 space-y-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              name="email"
              id="email"
              placeholder="m@example.com"
              required
              className="border-white/30 bg-white/30 dark:bg-white/10 backdrop-blur-md
                         focus-visible:ring-2 focus-visible:ring-emerald-400 text-foreground
                         placeholder:text-muted-foreground/70"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="********"
              required
              className="border-white/30 bg-white/30 dark:bg-white/10 backdrop-blur-md
                         focus-visible:ring-2 focus-visible:ring-emerald-400 text-foreground
                         placeholder:text-muted-foreground/70"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              disabled={status === "pending"}
              className="w-full bg-emerald-500/80 hover:bg-emerald-400/90 text-white
                         backdrop-blur-md shadow-[0_4px_20px_rgba(16,185,129,0.4)]
                         transition-all duration-300 hover:scale-[1.02]"
            >
              {status === "pending" ? "..." : actionText}
            </Button>

            <Button
              variant="outline"
              type="button"
              className="w-full bg-white/20 dark:bg-white/10 border-white/30
                         text-foreground backdrop-blur-md hover:scale-[1.02] 
                         transition-all duration-300"
            >
              Continue with Google
            </Button>
          </div>

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
