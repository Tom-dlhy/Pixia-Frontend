import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import { getChatWithDocument, type ChatWithDocumentResponse } from "~/server/chat.server"
import { useAppSession } from "~/utils/session"

export interface UseSessionCacheOptions {
  enabled?: boolean
  staleTime?: number
}

/**
 * Hook pour fetcher et cacher les données chat + document
 * 
 * 🎯 Bénéfices:
 * - Déduplique automatiquement les requêtes en vol
 * - Cache les résultats pour éviter les refetch inutiles
 * - Permet de prefetch les données avant la navigation
 * 
 * @param sessionId - L'ID de la session
 * @param docType - Type de document (exercise ou course) - auto-détection si non fourni
 * @param userId - User ID (optionnel, utilise la session par défaut)
 * @param options - Options du hook
 * @returns État du cache avec messages, document, et loading/error
 */
export function useSessionCache(
  sessionId: string | null,
  docType?: "exercise" | "course",
  userId?: string,
  options: UseSessionCacheOptions = {}
) {
  const { session } = useAppSession()
  const queryClient = useQueryClient()
  
  // 🔑 Memoize resolvedUserId pour éviter les re-renders inutiles
  const resolvedUserId = useMemo(
    () => userId || (session.userId != null ? String(session.userId) : "anonymous-user"),
    [userId, session.userId]
  )

  // 🔑 Clé unique pour ce cache
  // Format: ["sessionCache", sessionId, docType, userId]
  // Changer docType ou userId invalide automatiquement le cache
  const queryKey = ["sessionCache", sessionId, docType, resolvedUserId] as const

  // 📊 Query React Query
  const {
    data = { messages: [], document: null, documentType: null },
    isLoading,
    error,
    isFetching,
    isRefetching,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<ChatWithDocumentResponse> => {
      if (!sessionId) {
        throw new Error("sessionId is required")
      }

      console.group(`%c🚀 [useSessionCache] Fetching (${docType || "auto"})`, 'color: #3b82f6; font-weight: bold; font-size: 12px;')
      console.log(`📍 session_id: ${sessionId}`)
      console.log(`👤 user_id: ${resolvedUserId}`)
      console.log(`🏷️ doc_type: ${docType || 'auto-detect'}`)
      console.trace('Call stack trace:')
      console.groupEnd()

      return await getChatWithDocument({
        data: {
          user_id: resolvedUserId,
          session_id: sessionId,
          doc_type: docType,
        },
      })
    },
    enabled: options.enabled !== false && !!sessionId,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes par défaut
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  })

  return {
    data,
    isLoading,
    isFetching,
    isRefetching,
    error: error instanceof Error ? error : null,
    // Fonction utile pour prefetch la session suivante
    prefetch: (nextSessionId: string, nextDocType?: "exercise" | "course") => {
      if (!nextSessionId) return
      queryClient.prefetchQuery({
        queryKey: ["sessionCache", nextSessionId, nextDocType, resolvedUserId],
        queryFn: () =>
          getChatWithDocument({
            data: {
              user_id: resolvedUserId,
              session_id: nextSessionId,
              doc_type: nextDocType,
            },
          }),
        staleTime: 5 * 60 * 1000,
      })
    },
  }
}
