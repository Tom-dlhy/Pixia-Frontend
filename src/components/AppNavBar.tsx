"use client"
import { Link } from "@tanstack/react-router"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { Button } from "~/components/ui/button"
import { useCourseType } from "~/context/CourseTypeContext"
import { cn } from "~/lib/utils"

// Couleurs seulement au survol; palette alignée sur la sidebar.
function colorClasses(kind: 'exercice' | 'cours' | 'deep') {
  switch (kind) {
    case 'exercice':
      return 'hover:bg-blue-200/70 dark:hover:bg-blue-800/40'
    case 'cours':
      return 'hover:bg-green-200/70 dark:hover:bg-green-800/40'
    case 'deep':
      return 'hover:bg-red-200/70 dark:hover:bg-red-800/40'
  }
}

export function AppNavBar() {
  const { setCourseType } = useCourseType()

  return (
    <header className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground px-4 py-2 shadow-sm">
      <div className="flex items-center w-full">
        <SidebarTrigger
          className="h-8 w-8 flex-shrink-0"
          aria-label="Toggle sidebar"
        />
        <div className="flex-1 flex justify-center">
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCourseType('exercice')}
              className={cn(
                'text-sidebar-foreground',
                colorClasses('exercice')
              )}
            >
              Exercice
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCourseType('cours')}
              className={cn(
                'text-sidebar-foreground',
                colorClasses('cours')
              )}
            >
              Cours
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCourseType('deep')}
              className={cn(
                'text-sidebar-foreground',
                colorClasses('deep')
              )}
            >
              Cours Approfondis
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                'text-sidebar-foreground',
                'hover:bg-sidebar-accent/80 dark:hover:bg-sidebar-accent/40'
              )}
            >
              <Link
                to="/posts"
                activeProps={{
                  className:
                    'bg-sidebar-accent text-sidebar-accent-foreground',
                }}
              >
                Deep Courses
              </Link>
            </Button>
          </div>
        </div>
        <div className="w-8" />
      </div>
    </header>
  )
}
