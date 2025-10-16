import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/search')({
  component: SearchPage,
})

function SearchPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Recherche</h1>
      <p className="text-muted-foreground">
        Recherchez des conversations, des cours ou des ressources rapidement.
      </p>
    </div>
  )
}
