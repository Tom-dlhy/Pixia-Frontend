export function TestLayout() {
  return (
    <div className="flex min-h-dvh w-full flex-col border-4 border-green-400 overflow-hidden">
      {/* NavBar */}
      <header className="bg-blue-300 p-4 border-b border-black">
        <p>NavBar</p>
      </header>

      {/* Zone principale */}
      <div className="flex flex-1 border-4 border-red-400 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-yellow-300 border-r border-black p-4">
          <p>Sidebar</p>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 overflow-auto bg-purple-300 p-4">
          <p>Contenu principal</p>
        </main>
      </div>
    </div>
  )
}
