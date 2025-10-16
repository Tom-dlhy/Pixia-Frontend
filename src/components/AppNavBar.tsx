"use client"
import { Link } from "@tanstack/react-router"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { useCourseType } from "~/context/CourseTypeContext"
import { cn } from "~/lib/utils"

// Couleurs seulement au survol; palette alignée sur la sidebar.
function colorClasses(kind: 'exercice' | 'cours' | 'discuss' | 'deep') {
  switch (kind) {
    case 'exercice':
      return 'hover:bg-blue-200/70 dark:hover:bg-blue-800/40'
    case 'cours':
      return 'hover:bg-green-200/70 dark:hover:bg-green-800/40'
    case 'discuss':
      return 'hover:bg-amber-200/70 dark:hover:bg-amber-700/40'
    case 'deep':
      return 'hover:bg-red-200/70 dark:hover:bg-red-800/40'
  }
}

export function AppNavBar() {
  const { setCourseType } = useCourseType()

  const baseBtn =
    'px-4 py-2 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 ring-offset-sidebar bg-transparent text-sidebar-foreground'

  return (
    <header className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground px-4 py-2 shadow-sm">
      <div className="flex items-center w-full">
        <SidebarTrigger
          className="h-8 w-8 flex-shrink-0"
          aria-label="Toggle sidebar"
        />
        <div className="flex-1 flex justify-center">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setCourseType('exercice')}
              className={cn(baseBtn, colorClasses('exercice'))}
            >
              Exercice
            </button>
            <button
              type="button"
              onClick={() => setCourseType('cours')}
              className={cn(baseBtn, colorClasses('cours'))}
            >
              Cours
            </button>
            <button
              type="button"
              onClick={() => setCourseType('discuss')}
              className={cn(baseBtn, colorClasses('discuss'))}
            >
              Discussion
            </button>
            <button
              type="button"
              onClick={() => setCourseType('deep')}
              className={cn(baseBtn, colorClasses('deep'))}
            >
              Cours Approfondis
            </button>
            <Link
              to="/posts"
              className={cn(
                baseBtn,
                'hover:bg-sidebar-accent/80 dark:hover:bg-sidebar-accent/40'
              )}
              activeProps={{
                className:
                  'bg-sidebar-accent text-sidebar-accent-foreground',
              }}
            >
              Deep Courses
            </Link>
          </div>
        </div>
        <div className="w-8" />
      </div>
    </header>
  )
}
