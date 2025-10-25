import { useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"
import { useChatWithDocument } from "~/hooks/useDocument"
import { useCourseContent } from "~/context/CourseContentContext"
import { useDocumentTitle } from "~/context/DocumentTitleContext"
import { MarkdownRenderer } from '~/components/MarkdownRenderer'
import { isQCM, isOpen, CourseOutput } from "~/models/Document"
import { CourseWithChapters, Chapter } from "~/models/Course"
import { cn } from "~/lib/utils"

interface CombinedViewProps {
  sessionId: string
  documentType?: "exercise" | "course"
}

export function CombinedDocumentChatView({
  sessionId,
  documentType,
}: CombinedViewProps) {
  const { messages, document, documentType: detectedType, loading, error } =
    useChatWithDocument(sessionId, documentType ?? null)
  
  const { setCourse } = useCourseContent()
  const { setTitle } = useDocumentTitle()

  useEffect(() => {
    if (document && detectedType === "course") {
      const courseDoc = document as CourseOutput
      
      const chapters = courseDoc.chapters || courseDoc.parts || []
      
      const courseData: CourseWithChapters = {
        id: courseDoc.id || "",
        title: courseDoc.title || "Cours",
        chapters: chapters.map((ch: any): Chapter => ({
          id: ch.id_chapter || Math.random().toString(),
          title: ch.title || "",
          content: ch.content || "",
        })),
        type: "cours",
      }
      
      setCourse(courseData)
      setTitle(courseData.title)
    }
  }, [document, detectedType, setCourse, setTitle])

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        Erreur: {error.message}
      </div>
    )
  }

  return (
    <div className="flex h-full gap-6">
      <div className="flex-1 overflow-y-auto">
        {!document ? (
          <div className="text-center text-muted-foreground p-8">
            Aucun document trouvé
          </div>
        ) : detectedType === "exercise" ? (
          <ExerciseDisplay exercise={document} />
        ) : (
          <CourseDisplay course={document} />
        )}
      </div>

      <div className="flex-1 overflow-y-auto border-l">
        <div className="space-y-4 p-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground">
              Pas de messages
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  msg.type === "user"
                    ? "bg-blue-100 ml-8"
                    : "bg-gray-100 mr-8"
                }`}
              >
                <p className="text-sm">{msg.text || "(Message vide)"}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function MarkdownText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ node, ...props }) => <p className="mb-0" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          code: ({ node, ...props }) => (
            <code className="bg-muted px-1 py-0.5 rounded text-xs" {...props} />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}

function ExerciseDisplay({ exercise }: any) {
  if (!exercise.exercises) {
    return <div>Pas d'exercices</div>
  }

  return (
    <div className="space-y-6 p-6">
      {exercise.exercises.map((block: any, idx: number) => {
        if (isQCM(block)) {
          return (
            <div key={idx} className="border rounded-lg p-4">
              <h3 className="font-bold text-lg">{block.topic}</h3>
              <div className="mt-4 space-y-4">
                {block.questions.map((q: any) => (
                  <div key={q.id} className="border-l-2 pl-4">
                    <MarkdownText text={q.question} className="!prose-sm" />
                    <div className="mt-2 space-y-1">
                      {q.answers.map((a: any) => (
                        <label key={a.id} className="flex items-center gap-2">
                          <input
                            type={q.multi_answers ? "checkbox" : "radio"}
                            disabled
                            checked={a.is_selected}
                          />
                          <div
                            className={
                              a.is_correct ? "text-green-600 font-semibold" : ""
                            }
                          >
                            <MarkdownText text={a.text} className="!prose-sm" />
                          </div>
                        </label>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="text-sm text-gray-600 mt-2">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        } else if (isOpen(block)) {
          return (
            <div key={idx} className="border rounded-lg p-4">
              <h3 className="font-bold text-lg">{block.topic}</h3>
              <div className="mt-4 space-y-4">
                {block.questions.map((q: any) => (
                  <div key={q.id} className="border-l-2 pl-4">
                    <MarkdownText text={q.question} className="!prose-sm" />
                    <textarea
                      className="w-full mt-2 p-2 border rounded"
                      placeholder="Votre réponse..."
                      defaultValue={q.answers}
                      disabled
                    />
                    {q.explanation && (
                      <div className="text-sm text-gray-600 mt-2">
                        💡 <MarkdownText text={q.explanation} className="!prose-sm inline" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        }
      })}
    </div>
  )
}

function CourseDisplay({ course }: any) {
  if (!course.chapters) {
    return <div>Pas de chapitres</div>
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">{course.title}</h1>
      {course.chapters.map((chapter: any, idx: number) => (
        <div key={chapter.id_chapter || idx} className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold">{chapter.title}</h2>
          <div className="mt-4">
            <MarkdownRenderer content={chapter.content} />
          </div>
          {chapter.schema_description && (
            <p className="text-sm text-gray-600 mt-4">
              Schéma: {chapter.schema_description}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
