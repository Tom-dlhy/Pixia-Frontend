"use client"

import * as React from 'react'
import { toast } from 'sonner'

export type SettingsFormState = {
  fullName: string
  notion: string
  gmail: string
  drive: string
  studyLevel: string
}

const STORAGE_KEY = 'app-settings'

const defaultSettings: SettingsFormState = {
  fullName: '',
  notion: '',
  gmail: '',
  drive: '',
  studyLevel: '',
}

interface SettingsContextValue {
  settings: SettingsFormState
  updateSettings: (partial: Partial<SettingsFormState>) => void
  replaceSettings: (s: SettingsFormState, opts?: { silent?: boolean }) => void
  isLoaded: boolean
}

const SettingsContext = React.createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<SettingsFormState>(defaultSettings)
  const [isLoaded, setIsLoaded] = React.useState(false)

  // Load from localStorage once on mount (client-side only)
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SettingsFormState>
        setSettings((prev) => ({ ...prev, ...parsed }))
      }
    } catch (err) {
      console.error('Failed to parse stored settings', err)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Persist whenever settings change (after initial load)
  React.useEffect(() => {
    if (!isLoaded) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (err) {
      console.error('Failed to persist settings', err)
    }
  }, [settings, isLoaded])

  // Listen to storage changes from other tabs
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as Partial<SettingsFormState>
          setSettings((prev) => ({ ...prev, ...parsed }))
        } catch (err) {
          console.error('Failed to sync settings from other tab', err)
        }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const updateSettings = React.useCallback(
    (partial: Partial<SettingsFormState>) => {
      setSettings((prev) => ({ ...prev, ...partial }))
    },
    []
  )

  const replaceSettings = React.useCallback(
    (s: SettingsFormState, opts?: { silent?: boolean }) => {
      setSettings(s)
      if (!opts?.silent) {
        toast.success('Modifications enregistrées.', {
          className:
            'border border-emerald-400 bg-emerald-100 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-100',
        })
      }
    },
    []
  )

  const value = React.useMemo<SettingsContextValue>(
    () => ({ settings, updateSettings, replaceSettings, isLoaded }),
    [settings, updateSettings, replaceSettings, isLoaded]
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = React.useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}

export { STORAGE_KEY, defaultSettings }
