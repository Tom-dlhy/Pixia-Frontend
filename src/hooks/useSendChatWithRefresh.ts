import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { sendChatMessage } from "~/server/chat.server"

interface SendChatParams {
  user_id: string
  message: string
  sessionId?: string
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

/**
 * Hook pour envoyer un message chat ET automatically refetch les données
 * 
 * 🎯 Avantages:
 * - Envoie le message
 * - Invalide automatiquement le cache des messages APRÈS la réponse
 * - Évite les appels manuels à invalidateQueries
 * 
 * @param onSuccess - Callback optionnel après succès
 * @returns Fonction pour envoyer le message + état (loading, error)
 */
export function useSendChatWithRefresh(
  onSuccess?: (response: Awaited<ReturnType<typeof sendChatMessage>>) => void
) {
  const queryClient = useQueryClient()

  const send = useCallback(
    async (params: SendChatParams) => {
      try {
        console.log(`📨 [useSendChatWithRefresh] Envoi du message...`)

        // Envoyer le message via la server function
        const response = await sendChatMessage({ data: params })

        console.log(`✅ [useSendChatWithRefresh] Message envoyé avec succès`)

        // Invalider le cache de session pour refetch les messages
        if (params.sessionId) {
          console.log(`🔄 [useSendChatWithRefresh] Invalidating sessionCache for: ${params.sessionId}`)
          
          // Invalider TOUTES les queries de cache de session (peu importe le docType)
          // Cela force un refetch des messages quand le component re-read les données
          await queryClient.invalidateQueries({
            queryKey: ["sessionCache", params.sessionId],
            // Cette option fait matcher n'importe quel queryKey commençant par ces éléments
            exact: false,
          })

          console.log(`✅ [useSendChatWithRefresh] Cache invalidated, refetch will happen on next read`)
        }

        // Invalider aussi le cache "allChatSessions" car on a peut-être créé une nouvelle session
        if (params.user_id) {
          console.log(`🔄 [useSendChatWithRefresh] Also invalidating allChatSessions`)
          await queryClient.invalidateQueries({
            queryKey: ["allChatSessions", params.user_id],
            exact: false,
          })
        }

        // Appeler le callback optionnel
        await onSuccess?.(response)

        return response
      } catch (error) {
        console.error(`❌ [useSendChatWithRefresh] Erreur:`, error)
        throw error
      }
    },
    [queryClient, onSuccess]
  )

  return { send }
}
