import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import { getChatWithDocument, type ChatWithDocumentResponse } from "~/server/chat.server"
import { useAppSession } from "~/utils/session"

export interface UseSessionCacheOptions {
  enabled?: boolean
  staleTime?: number
}

export function useSessionCache(
  sessionId: string | null,
  docType?: "exercise" | "course",
  userId?: string,
  options: UseSessionCacheOptions = {}
) {
  const { session } = useAppSession()
  const queryClient = useQueryClient()
  
  const resolvedUserId = useMemo(
    () => userId || (session.userId != null ? String(session.userId) : "anonymous-user"),
    [userId, session.userId]
  )

  const queryKey = ["sessionCache", sessionId, docType, resolvedUserId] as const

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

      return await getChatWithDocument({
        data: {
          user_id: resolvedUserId,
          session_id: sessionId,
          doc_type: docType,
        },
      })
    },
    enabled: options.enabled !== false && !!sessionId,
    staleTime: options.staleTime ?? undefined,
    retry: 1,
  })

  return {
    data,
    isLoading,
    isFetching,
    isRefetching,
    error: error instanceof Error ? error : null,
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
