import { cn } from "~/lib/utils"

interface SectionTitleProps {
  title: string
  subtitle?: string
  align?: "left" | "center" | "right"
  size?: "sm" | "md" | "lg"
  className?: string 
}

export default function SectionTitle({
  title,
  subtitle,
  align = "center",
  size = "lg",
  className, 
}: SectionTitleProps) {
  const sizes = {
    sm: "text-xl font-semibold",
    md: "text-2xl font-semibold sm:text-3xl",
    lg: "text-3xl font-semibold sm:text-4xl",
  }[size]

  const alignment = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align]

  return (
    <div className={cn(alignment, className)}> 
      <h1 className={sizes}>{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  )
}
