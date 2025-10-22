import * as React from "react"
import { cn } from "~/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent",
        className
      )}
      role="status"
      aria-label="loading"
      {...props}
    />
  )
}
