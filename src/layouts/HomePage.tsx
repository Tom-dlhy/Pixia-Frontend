"use client"

import { Chat } from "~/components/Chat"
import { SectionCards } from "~/components/SectionCards"

export function HomePage() {
  return (
    <section className="relative z-10 flex flex-1 flex-col gap-8 overflow-y-auto min-h-0 px-6 py-8 sm:px-10 sm:py-10 lg:px-16 lg:py-12">
      {/* Liste des sections/cours */}
      <div className="w-full max-w-4xl mx-auto">
        <SectionCards />
      </div>

      {/* Chat principal */}
      <div className="w-full max-w-4xl flex-1 flex flex-col min-h-0 mx-auto">
        <Chat />
      </div>
    </section>
  )
}
