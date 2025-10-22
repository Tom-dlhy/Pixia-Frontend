import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/exercise/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Liste des exercices</h2>
      <p className="text-muted-foreground">Sélectionnez un exercice pour commencer</p>
    </div>
  )
}
