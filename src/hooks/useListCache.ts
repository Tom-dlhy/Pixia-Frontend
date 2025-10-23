import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { getAllChatSessions, getAllDeepCourses } from "~/server/chat.server"
import { useAppSession } from "~/utils/session"

/**
 * Hook pour fetcher et cacher toutes les sessions chat
 * 
 * 🎯 Bénéfices:
 * - Déduplique automatiquement les requêtes en vol
 * - Cache les résultats pour 5 minutes
 * - Utilisable depuis plusieurs composants sans doublon
 * 
 * @param options - Options du hook
 * @returns État du cache avec sessions et loading/error
 */
export function useAllChatSessions(options = {}) {
  const { session } = useAppSession()

  // 🔑 Memoize userId pour éviter les re-renders inutiles
  const userId = useMemo(
    () => session.userId != null ? String(session.userId) : "anonymous-user",
    [session.userId]
  )

  // 🔑 Clé unique pour ce cache
  // Format: ["allChatSessions", userId]
  const queryKey = ["allChatSessions", userId] as const

  const {
    data = [],
    isLoading,
    error,
    isFetching,
    isRefetching,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!userId || userId === "anonymous-user") {
        console.log("⚠️ [useAllChatSessions] Utilisateur non authentifié, skip")
        return []
      }

      console.log(`%c🚀 [useAllChatSessions] Fetching with queryKey:`, 'color: #3b82f6; font-weight: bold; font-size: 12px;', queryKey)
      console.log(`👤 user_id: ${userId}`)

      return await getAllChatSessions({
        data: {
          user_id: userId,
        },
      })
    },
    enabled: !!userId && userId !== "anonymous-user",
    staleTime: 5 * 60 * 1000, // 5 minutes par défaut
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // ← NOUVEAU: Ne pas refetch au montage si cache existe
    refetchOnReconnect: false, // ← NOUVEAU: Ne pas refetch si reconnexion réseau
    retry: 1,
  })

  // 🔑 Memoize the returned object to prevent dependency array churn in downstream useMemo calls
  return useMemo(
    () => ({
      sessions: data,
      isLoading,
      isFetching,
      isRefetching,
      error: error instanceof Error ? error : null,
    }),
    [data, isLoading, isFetching, isRefetching, error]
  )
}

/**
 * Hook pour fetcher et cacher tous les deep-courses
 * 
 * 🎯 Bénéfices:
 * - Déduplique automatiquement les requêtes en vol
 * - Cache les résultats pour 5 minutes
 * - Utilisable depuis plusieurs composants sans doublon
 * 
 * @param options - Options du hook
 * @returns État du cache avec deepCourses et loading/error
 */
export function useAllDeepCourses(options = {}) {
  const { session } = useAppSession()

  // 🔑 Memoize userId pour éviter les re-renders inutiles
  const userId = useMemo(
    () => session.userId != null ? String(session.userId) : "anonymous-user",
    [session.userId]
  )

  // 🔑 Clé unique pour ce cache
  // Format: ["allDeepCourses", userId]
  const queryKey = ["allDeepCourses", userId] as const

  const {
    data = [],
    isLoading,
    error,
    isFetching,
    isRefetching,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!userId || userId === "anonymous-user") {
        console.log("⚠️ [useAllDeepCourses] Utilisateur non authentifié, skip")
        return []
      }

      console.log(`%c🚀 [useAllDeepCourses] Fetching with queryKey:`, 'color: #8b5cf6; font-weight: bold; font-size: 12px;', queryKey)
      console.log(`👤 user_id: ${userId}`)

      return await getAllDeepCourses({
        data: {
          user_id: userId,
        },
      })
    },
    enabled: !!userId && userId !== "anonymous-user",
    staleTime: 5 * 60 * 1000, // 5 minutes par défaut
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // ← NOUVEAU: Ne pas refetch au montage si cache existe
    refetchOnReconnect: false, // ← NOUVEAU: Ne pas refetch si reconnexion réseau
    retry: 1,
  })

  // 🔑 Memoize the returned object to prevent dependency array churn in downstream useMemo calls
  return useMemo(
    () => ({
      deepCourses: data,
      isLoading,
      isFetching,
      isRefetching,
      error: error instanceof Error ? error : null,
    }),
    [data, isLoading, isFetching, isRefetching, error]
  )
}
