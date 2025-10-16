import * as React from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const getThemeFromDocument = (): ToasterProps["theme"] => {
  if (typeof document === "undefined") return "light"
  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light"
}

const Toaster = ({ ...props }: ToasterProps) => {
  const [theme, setTheme] = React.useState<ToasterProps["theme"]>(() => getThemeFromDocument())

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return
    const updateTheme = () => setTheme(getThemeFromDocument())
    updateTheme()

    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    window.addEventListener("themechange", updateTheme)

    return () => {
      observer.disconnect()
      window.removeEventListener("themechange", updateTheme)
    }
  }, [])

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
