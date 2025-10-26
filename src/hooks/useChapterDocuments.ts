import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { getChapterDocuments } from "~/server/chat.server"

export function useChapterDocuments(
  chapterId: string | undefined,
  options?: { enabled?: boolean }
) {
  const memoizedChapterId = useMemo(() => chapterId, [chapterId])
  const { enabled = !!memoizedChapterId } = options || {}

  return useQuery({
    queryKey: ["chapterDocuments", memoizedChapterId],
    queryFn: async () => {
      if (!memoizedChapterId) {
        return {
          chapter_id: "",
          exercice_session_id: "",
          course_session_id: "",
          evaluation_session_id: "",
        }
      }
      const result = await getChapterDocuments({ data: { chapter_id: memoizedChapterId } })
      return result
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false, 
    refetchOnReconnect: false,
  })
}
