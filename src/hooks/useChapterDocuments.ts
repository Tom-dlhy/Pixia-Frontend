import { useQuery } from "@tanstack/react-query"
import { getChapterDocuments } from "~/server/chat.server"

/**
 * Hook pour récupérer les IDs des documents d'un chapitre (cours, exercice, évaluation)
 * 
 * Utilise le système de cache fresh data avec staleTime: 0
 */
export function useChapterDocuments(
  chapterId: string | undefined,
  options?: { enabled?: boolean }
) {
  const { enabled = !!chapterId } = options || {}

  return useQuery({
    queryKey: ["chapterDocuments", chapterId],
    queryFn: async () => {
      if (!chapterId) {
        console.log(`⚠️ [useChapterDocuments] chapterId non fourni`)
        return {
          chapter_id: "",
          exercice_session_id: "",
          course_session_id: "",
          evaluation_session_id: "",
        }
      }

      console.log(`🔍 [useChapterDocuments] Récupération des documents pour chapitre: ${chapterId}`)
      const result = await getChapterDocuments({ data: { chapter_id: chapterId } })
      console.log(`✅ [useChapterDocuments] Documents récupérés:`, result)
      return result
    },
    enabled,
    staleTime: 0, // Toujours considérer les données comme fraîches
    gcTime: 30 * 1000, // Garbage collect après 30s
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}
