"use client"

import { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Create a client for the app that will be used to store server-side query state
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ⏰ Data is ALWAYS considered stale = always refetch on mount/focus
      staleTime: 0,
      
      // ⏰ Keep in cache for 30 seconds to avoid duplicate requests in flight
      gcTime: 30 * 1000,
      
      // 🔄 Always refetch on window focus (fresh data)
      refetchOnWindowFocus: true,
      
      // 🔄 Always refetch when component remounts (fresh data)
      refetchOnMount: true,
      
      // 🔄 Always refetch on reconnect (fresh data)
      refetchOnReconnect: true,
      
      // 🔄 Retry failed requests once
      retry: 1,
      
      // Abort query if it takes longer than 30 seconds
      queryKeyHashFn: (queryKey) => {
        return JSON.stringify(queryKey)
      },
    },
    mutations: {
      // 🔄 Retry mutations once on failure
      retry: 1,
    },
  },
})

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
