"use client"

import { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Create a client for the app that will be used to store server-side query state
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ⏰ How long data is considered "fresh" - 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // ⏰ How long to keep unused data in cache - 10 minutes
      gcTime: 10 * 60 * 1000,
      
      // 🔄 Avoid automatic refetching on window focus
      refetchOnWindowFocus: false,
      
      // 🔄 Avoid refetching when component remounts if cache is fresh
      refetchOnMount: false,
      
      // 🔄 Avoid refetching on reconnect
      refetchOnReconnect: false,
      
      // 🔄 Don't retry failed requests
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
