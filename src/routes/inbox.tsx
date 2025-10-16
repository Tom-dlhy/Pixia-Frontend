import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/inbox')({
  component: InboxPage,
})

function InboxPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Inbox</h1>
      <p className="text-muted-foreground">
        Vous n'avez aucun message pour le moment. Revenez plus tard.
      </p>
    </div>
  )
}
