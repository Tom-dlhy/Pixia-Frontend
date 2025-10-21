/**
 * Exemple d'utilisation du hook useChatWithDocument
 * Affiche un document à gauche et le chat à droite
 * (comme dans ChatQuickViewLayout)
 */

import { useChatWithDocument } from "~/hooks/useDocument"
import { isQCM, isOpen } from "~/models/Document"

interface CombinedViewProps {
  sessionId: string
  documentType?: "exercise" | "course"
}

export function CombinedDocumentChatView({
  sessionId,
  documentType,
}: CombinedViewProps) {
  const { messages, document, documentType: detectedType, loading, error } =
    useChatWithDocument(sessionId, documentType)

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
      {/* LEFT PANEL - Document */}
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

      {/* RIGHT PANEL - Chat Messages */}
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

// ==================== DISPLAY COMPONENTS ====================

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
                    <p className="font-semibold">{q.question}</p>
                    <div className="mt-2 space-y-1">
                      {q.answers.map((a: any) => (
                        <label key={a.id} className="flex items-center gap-2">
                          <input
                            type={q.multi_answers ? "checkbox" : "radio"}
                            disabled
                            checked={a.is_selected}
                          />
                          <span
                            className={
                              a.is_correct ? "text-green-600 font-semibold" : ""
                            }
                          >
                            {a.text}
                          </span>
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
                    <p className="font-semibold">{q.question}</p>
                    <textarea
                      className="w-full mt-2 p-2 border rounded"
                      placeholder="Votre réponse..."
                      defaultValue={q.answers}
                      disabled
                    />
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
          <div className="mt-4 prose prose-sm max-w-none">
            {/* Ici, vous voudriez utiliser react-markdown pour le contenu */}
            <p>{chapter.content}</p>
          </div>
          {chapter.schema_description && (
            <p className="text-sm text-gray-600 mt-4">
              📊 Schéma: {chapter.schema_description}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
