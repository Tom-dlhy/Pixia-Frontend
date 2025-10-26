"use client"

import { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      
      gcTime: 30 * 1000,
      
      refetchOnWindowFocus: true,
      
      refetchOnMount: true,
      
      refetchOnReconnect: true,
      
      retry: 1,
      
      queryKeyHashFn: (queryKey) => {
        return JSON.stringify(queryKey)
      },
    },
    mutations: {
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
