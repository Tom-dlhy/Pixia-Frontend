import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/calendar')({
  component: CalendarPage,
})

function CalendarPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Calendrier</h1>
      <p className="text-muted-foreground">
        Planifiez vos événements et retrouvez vos rendez-vous importants ici.
      </p>
    </div>
  )
}
