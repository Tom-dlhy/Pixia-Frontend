"use client"

import { ChevronsUpDown, User } from "lucide-react"
import { Link, useRouter } from "@tanstack/react-router"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar"
import { ThemeSwitch } from "~/components/theme-switch"
import { SignOut } from "~/components/profile/SignOut"
import { cn } from "~/lib/utils"
import { useAppSession } from "~/utils/session"
import { useSettings } from "~/context/SettingsProvider"
import { useEffect, useMemo } from "react"

interface NavUserProps {
  user: {
    id?: string
    name?: string | null
    email?: string | null
  }
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { session } = useAppSession()
  const { settings, updateSettings, isLoaded } = useSettings()

  const userFullName = user.givenName || user.familyName
    ? [user.givenName, user.familyName].filter(Boolean).join(" ")
    : null

  const sessionFullName = session.name || null

  const resolvedEmail = user.email ?? session.userEmail ?? settings.gmail ?? ""
  const resolvedName = user.name ?? session.name ?? settings.fullName ?? null

  useEffect(() => {
    const preferredEmail = user.email ?? session.userEmail ?? null
    if (!isLoaded || !preferredEmail) return
    if (!settings.gmail) {
      updateSettings({ gmail: preferredEmail })
    }
  }, [isLoaded, user.email, session.userEmail, settings.gmail, updateSettings])

  useEffect(() => {
    const preferredName = resolvedName
    if (!isLoaded || !preferredName) return
    if (!settings.fullName) {
      updateSettings({ fullName: preferredName })
    }
  }, [isLoaded, resolvedName, settings.fullName, updateSettings])

  const displayName = useMemo(() => {
    if (resolvedName) return resolvedName
    if (resolvedEmail) return resolvedEmail.split("@")[0]
    return "Utilisateur"
  }, [resolvedName, resolvedEmail])

  const initial = (displayName?.[0] ?? resolvedEmail?.[0] ?? "?").toUpperCase()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                "cursor-pointer transition-all duration-300 relative overflow-hidden",
                "border border-white/20 dark:border-white/10",
                "bg-[rgba(255,255,255,0.15)] dark:bg-[rgba(24,24,27,0.4)]",
                "backdrop-blur-xl backdrop-saturate-150",
                "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_8px_20px_rgba(0,0,0,0.15)]",
                "hover:scale-[1.03]",
                "hover:shadow-[inset_0_1px_4px_rgba(255,255,255,0.6),0_10px_25px_rgba(0,0,0,0.2)]",
                "hover:before:absolute hover:before:inset-0 hover:before:rounded-lg hover:before:bg-[rgba(255,255,255,0.25)] dark:hover:before:bg-[rgba(255,255,255,0.08)] hover:before:blur-[6px] hover:before:content-['']",
                "data-[state=open]:bg-[rgba(255,255,255,0.25)] dark:data-[state=open]:bg-[rgba(24,24,27,0.55)]"
              )}
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={undefined} alt={displayName} />
                <AvatarFallback className="rounded-lg">{initial}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs">{resolvedEmail}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-70" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent
            className={cn(
              "min-w-72 rounded-2xl px-4 py-4 border border-white/20 dark:border-white/10",
              "bg-[rgba(255,255,255,0.25)] dark:bg-[rgba(24,24,27,0.45)]",
              "backdrop-blur-2xl backdrop-saturate-150",
              "shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            )}
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex flex-col items-center gap-2 text-center text-sm">
                <Avatar className="mb-2 h-16 w-16 rounded-lg">
                  <AvatarImage src={undefined} alt={displayName} />
                  <AvatarFallback className="rounded-lg text-xl">{initial}</AvatarFallback>
                </Avatar>
                <div className="flex w-full flex-col items-center px-2">
                  <span className="text-base font-medium">{displayName}</span>
                  <span className="text-xs text-muted-foreground">{resolvedEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="my-2 opacity-20" />

            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                router.navigate({ to: "/settings" })
              }}
              className={menuItemClass}
            >
              Paramètres
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className={menuItemClass}
            >
              <div className="flex w-full items-center justify-between">
                <span>Thème</span>
                <ThemeSwitch />
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-2 opacity-20" />

            <div className="px-1">
              <SignOut />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

/* --- Classe commune pour hover harmonisé --- */
const menuItemClass = cn(
  "cursor-pointer transition-all duration-300 relative overflow-hidden rounded-md px-2 py-1.5",
  "hover:scale-[1.02]",
  "hover:shadow-[inset_0_0_6px_rgba(255,255,255,0.4),0_6px_18px_rgba(0,0,0,0.15)]",
  "hover:before:absolute hover:before:inset-0 hover:before:rounded-md hover:before:bg-[rgba(255,255,255,0.25)] dark:hover:before:bg-[rgba(255,255,255,0.08)] hover:before:blur-[4px] hover:before:content-['']"
)

/* --- INVITÉ --- */
export function NavGuest() {
  return (
    <div className="flex flex-col gap-3">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            size="lg"
            className={cn(
              "cursor-pointer transition-all duration-300 relative overflow-hidden",
              "border border-white/20 dark:border-white/10",
              "bg-[rgba(255,255,255,0.15)] dark:bg-[rgba(24,24,27,0.4)]",
              "backdrop-blur-xl backdrop-saturate-150",
              "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_8px_20px_rgba(0,0,0,0.15)]",
              "hover:scale-[1.03]",
              "hover:shadow-[inset_0_1px_4px_rgba(255,255,255,0.6),0_10px_25px_rgba(0,0,0,0.2)]",
              "hover:before:absolute hover:before:inset-0 hover:before:rounded-lg hover:before:bg-[rgba(255,255,255,0.25)] dark:hover:before:bg-[rgba(255,255,255,0.08)] hover:before:blur-[6px] hover:before:content-['']"
            )}
          >
            <Link to="/login" className="flex items-center gap-2">
              <User className="size-4 opacity-80" />
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium">Se connecter</span>
                <span className="text-xs text-muted-foreground">
                  Accéder à votre compte
                </span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <div className="flex justify-end pr-2">
        <ThemeSwitch className="h-8 w-8" />
      </div>
    </div>
  )
}
