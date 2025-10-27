import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { sendChatMessage } from "~/server/chat.server"

interface SendChatParams {
  user_id: string
  message: string
  sessionId?: string
  deepCourseId?: string
  files?: Array<{
    name: string
    type?: string
    size?: number
    data: string
  }>
  messageContext?: {
    selectedCardType?: "cours" | "exercice"
    currentRoute?: "chat" | "deep-course" | "course" | "exercice"
    deepCourseId?: string
    userFullName?: string
  }
}

export function useSendChatWithRefresh(
  onSuccess?: (response: Awaited<ReturnType<typeof sendChatMessage>>) => void
) {
  const queryClient = useQueryClient()

  const send = useCallback(
    async (params: SendChatParams) => {
      try {
        const response = await sendChatMessage({ data: params })
        if (params.sessionId) {
          await queryClient.invalidateQueries({
            queryKey: ["sessionCache", params.sessionId],
            exact: false,
          })
        }

        if (params.user_id) {
          await queryClient.invalidateQueries({
            queryKey: ["allChatSessions", params.user_id],
            exact: false,
          })
        }

        await onSuccess?.(response)

        return response
      } catch (error) {
        console.error(`[useSendChatWithRefresh] Erreur:`, error)
        throw error
      }
    },
    [queryClient, onSuccess]
  )

  return { send }
}
