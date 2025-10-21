import { createFileRoute } from '@tanstack/react-router'
import { useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/exercise/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = useParams({ from: '/_authed/exercise/$id' })
  
  return (
    <div className="flex flex-col gap-4">
      <div className="text-2xl font-bold">Contenu de l'exercice</div>
      <div className="text-sm text-muted-foreground">ID: {id}</div>
      <div className="bg-muted/50 rounded-lg p-4 mt-4">
        <p>Contenu principal de l'exercice va s'afficher ici...</p>
      </div>
    </div>
  )
}
