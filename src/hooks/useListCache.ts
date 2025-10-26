import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { getAllChatSessions, getAllDeepCourses } from "~/server/chat.server"
import { useAppSession } from "~/utils/session"

export function useAllChatSessions(options = {}) {
  const { session } = useAppSession()

  const userId = useMemo(
    () => session.userId != null ? String(session.userId) : "anonymous-user",
    [session.userId]
  )

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
        return []
      }


      return await getAllChatSessions({
        data: {
          user_id: userId,
        },
      })
    },
    enabled: !!userId && userId !== "anonymous-user",
    retry: 1,
  })

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

export function useAllDeepCourses(options = {}) {
  const { session } = useAppSession()

  const userId = useMemo(
    () => session.userId != null ? String(session.userId) : "anonymous-user",
    [session.userId]
  )

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
        return []
      }

      return await getAllDeepCourses({
        data: {
          user_id: userId,
        },
      })
    },
    enabled: !!userId && userId !== "anonymous-user",
    retry: 1,
  })

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
