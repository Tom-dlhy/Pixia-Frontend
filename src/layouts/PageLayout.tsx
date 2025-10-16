import React from "react"

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-background p-4 sm:p-8">
      {children}
    </main>
  )
}
