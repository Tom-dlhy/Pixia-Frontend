'use client'

import { useEffect, useState } from 'react'
import { ExerciseOutput, isQCM, isOpen } from '~/models/Document'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Checkbox } from '~/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import { QCMQuestion } from '~/models/Document'
import { useDocumentTitle } from '~/context/DocumentTitleContext'

interface ExerciseViewerProps {
  exercise: ExerciseOutput
}

/**
 * Affiche le contenu d'un exercice (QCM, questions ouvertes, etc)
 */
export function ExerciseViewer({ exercise }: ExerciseViewerProps) {
  const { setTitle } = useDocumentTitle()
  
  // State pour les réponses utilisateur
  // Format: { blockIdx_qIdx: string[] } pour multi-réponses ou string pour réponse unique
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({})
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({})
  
  // State pour suivre les questions corrigées et leurs résultats
  const [correctedQuestions, setCorrectedQuestions] = useState<Record<string, { isCorrect: boolean; showExplanation: boolean }>>({})
  
  // Set the document title in context when component mounts
  useEffect(() => {
    setTitle(exercise.title || null)
    return () => setTitle(null)
  }, [exercise.title, setTitle])
  
  if (!exercise.exercises || exercise.exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">Aucun exercice disponible</p>
      </div>
    )
  }

  // Handlers pour les réponses
  const handleRadioChange = (key: string, value: string) => {
    setUserAnswers(prev => ({ ...prev, [key]: value }))
  }

  const handleCheckboxChange = (key: string, value: string, checked: boolean) => {
    setUserAnswers(prev => {
      const current = (prev[key] as string[]) || []
      if (checked) {
        return { ...prev, [key]: [...current, value] }
      } else {
        return { ...prev, [key]: current.filter(v => v !== value) }
      }
    })
  }

  const handleOpenAnswerChange = (key: string, value: string) => {
    setOpenAnswers(prev => ({ ...prev, [key]: value }))
  }

  // Vérifier la réponse d'une question QCM
  const handleCheckQCM = (questionKey: string, question: QCMQuestion, isMultiAnswer: boolean) => {
    const userResponse = userAnswers[questionKey]
    
    let isCorrect = false
    
    if (isMultiAnswer) {
      // Pour les multi-réponses, vérifier que toutes les réponses sélectionnées sont correctes
      const userSelectedIndices = (userResponse as string[]) || []
      const correctIndices = question.answers
        .map((ans, idx) => ans.is_correct ? String(idx) : null)
        .filter((idx): idx is string => idx !== null)
      
      isCorrect = userSelectedIndices.length === correctIndices.length &&
                  userSelectedIndices.every(idx => correctIndices.includes(idx))
    } else {
      // Pour les réponses uniques
      const selectedIndex = String(userResponse ?? '')
      isCorrect = selectedIndex !== '' && question.answers[Number(selectedIndex)]?.is_correct === true
    }
    
    setCorrectedQuestions(prev => ({
      ...prev,
      [questionKey]: { isCorrect, showExplanation: true }
    }))
  }

  // Vérifier la réponse d'une question ouverte
  const handleCheckOpen = (questionKey: string) => {
    setCorrectedQuestions(prev => ({
      ...prev,
      [questionKey]: { isCorrect: false, showExplanation: true }
    }))
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Content - no header, it's in ChatQuickViewLayout */}
      <ScrollArea className="flex-1">
        <div className="space-y-8 pr-4 w-full">
          {exercise.exercises.map((block, blockIdx) => (
              <div key={blockIdx} className="space-y-4">
                {/* QCM */}
                {isQCM(block) && (
                  <div className="border border-white/20 dark:border-white/10 rounded-xl p-6 bg-muted/20 hover:bg-muted/30 transition-colors duration-200">
                    <h2 className="text-xl font-bold text-center mb-4 text-foreground">
                      {block.topic}
                    </h2>
                    
                    {/* Divider line */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
                    
                    <div className="space-y-6">
                      {block.questions.map((question: QCMQuestion, qIdx: number) => {
                        const questionKey = `${blockIdx}_${qIdx}`
                        const isMultiAnswer = question.multi_answers
                        const correctionState = correctedQuestions[questionKey]
                        const isCorrected = !!correctionState
                        const isAnswerCorrect = correctionState?.isCorrect
                        
                        return (
                          <div
                            key={qIdx}
                            className={`border rounded-lg bg-background/50 overflow-hidden transition-colors ${
                              isCorrected
                                ? isAnswerCorrect
                                  ? 'border-green-500/50 bg-green-50/5 dark:bg-green-950/10'
                                  : 'border-red-500/50 bg-red-50/5 dark:bg-red-950/10'
                                : 'border-white/20 dark:border-white/10'
                            }`}
                          >
                            {/* Header avec titre et bouton Correct */}
                            <div className={`flex items-center justify-between px-4 py-3 border-b ${
                              isCorrected
                                ? isAnswerCorrect
                                  ? 'bg-green-600/20 border-green-400'
                                  : 'bg-red-600/20 border-red-400'
                                : 'bg-white/5 dark:bg-white/5 border-white/10'
                            }`}>
                              <p className="font-semibold text-sm">{question.question}</p>
                              {!isCorrected ? (
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCheckQCM(questionKey, question, isMultiAnswer)}
                                >
                                  Vérifier
                                </Button>
                              ) : (
                                <div className={`px-3 py-1 rounded-md text-white text-xs font-semibold ${
                                  isAnswerCorrect ? 'bg-green-600' : 'bg-red-600'
                                }`}>
                                  {isAnswerCorrect ? '✓ Correct' : '✗ Incorrect'}
                                </div>
                              )}
                            </div>
                            
                            {/* Contenu */}
                            <div className="p-4">
                            
                            {/* Réponses avec Checkbox ou RadioGroup */}
                            {isMultiAnswer ? (
                              // Multi-réponses avec Checkbox
                              <div className="space-y-3 mb-4">
                                {question.answers.map((answer, aIdx) => {
                                  const isChecked = ((userAnswers[questionKey] as string[]) || []).includes(String(aIdx))
                                  
                                  return (
                                    <label
                                      key={aIdx}
                                      className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-colors ${
                                        isCorrected
                                          ? answer.is_correct
                                            ? 'bg-green-100/50 dark:bg-green-950/50 hover:bg-green-100/70 dark:hover:bg-green-950/70'
                                            : 'bg-red-100/50 dark:bg-red-950/50 hover:bg-red-100/70 dark:hover:bg-red-950/70'
                                          : 'hover:bg-muted/50'
                                      }`}
                                    >
                                      <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={(checked) =>
                                          !isCorrected && handleCheckboxChange(questionKey, String(aIdx), checked as boolean)
                                        }
                                        disabled={isCorrected}
                                      />
                                      <span className="text-sm flex-1">{answer.text}</span>
                                      {isCorrected && answer.is_correct && (
                                        <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                                          ✓ Correct
                                        </span>
                                      )}
                                    </label>
                                  )
                                })}
                              </div>
                            ) : (
                              // Réponse unique avec RadioGroup
                              <RadioGroup
                                value={String(userAnswers[questionKey] ?? '')}
                                onValueChange={(value) => !isCorrected && handleRadioChange(questionKey, value)}
                                className="mb-4"
                                disabled={isCorrected}
                              >
                                {question.answers.map((answer, aIdx) => (
                                  <label
                                    key={aIdx}
                                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-colors ${
                                      isCorrected
                                        ? answer.is_correct
                                          ? 'bg-green-100/50 dark:bg-green-950/50 hover:bg-green-100/70 dark:hover:bg-green-950/70'
                                          : 'bg-red-100/50 dark:bg-red-950/50 hover:bg-red-100/70 dark:hover:bg-red-950/70'
                                        : 'hover:bg-muted/50'
                                    }`}
                                  >
                                    <RadioGroupItem value={String(aIdx)} disabled={isCorrected} />
                                    <span className="text-sm flex-1">{answer.text}</span>
                                    {isCorrected && answer.is_correct && (
                                      <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                                        ✓ Correct
                                      </span>
                                    )}
                                  </label>
                                ))}
                              </RadioGroup>
                            )}
                            
                            {isCorrected && question.explanation && (
                              <div className="bg-accent/10 dark:bg-accent/5 rounded-lg p-3 text-xs border-l-4 border-accent">
                                <p className="font-semibold mb-2 text-accent-foreground">💡 Explication:</p>
                                <p className="text-accent-foreground/80">{question.explanation}</p>
                              </div>
                            )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Open Questions */}
                {isOpen(block) && (
                  <div className="border border-white/20 dark:border-white/10 rounded-xl p-6 bg-muted/20 hover:bg-muted/30 transition-colors duration-200">
                    <h2 className="text-xl font-bold text-center mb-4 text-foreground">
                      {block.topic}
                    </h2>
                    
                    {/* Divider line */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
                    
                    <div className="space-y-6">
                      {block.questions.map((question, qIdx: number) => {
                        const questionKey = `open_${blockIdx}_${qIdx}`
                        const correctionState = correctedQuestions[questionKey]
                        const isCorrected = !!correctionState
                        
                        return (
                          <div
                            key={qIdx}
                            className={`border rounded-lg bg-background/50 overflow-hidden transition-all duration-200 ${
                              isCorrected 
                                ? 'border-green-500/50 bg-green-500/5' 
                                : 'border-white/20 dark:border-white/10'
                            }`}
                          >
                            {/* Header avec titre et bouton Vérifier */}
                            <div className="flex items-center justify-between bg-white/5 dark:bg-white/5 px-4 py-3 border-b border-white/10">
                              <p className="font-semibold text-sm">{question.question}</p>
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (!isCorrected && openAnswers[questionKey]) {
                                    setCorrectedQuestions(prev => ({
                                      ...prev,
                                      [questionKey]: { isCorrect: false, showExplanation: true }
                                    }))
                                  }
                                }}
                                disabled={isCorrected || !openAnswers[questionKey]}
                              >
                                {isCorrected ? '✓ Vérifié' : 'Vérifier'}
                              </Button>
                            </div>
                            
                            {/* Contenu */}
                            <div className="p-4">
                            
                            {/* Textarea pour la réponse de l'utilisateur */}
                            <Textarea
                              placeholder="Entrez votre réponse ici..."
                              value={openAnswers[questionKey] ?? ''}
                              onChange={(e) => handleOpenAnswerChange(questionKey, e.target.value)}
                              disabled={isCorrected}
                              className="mb-4 min-h-[100px]"
                            />
                            
                            {/* Réponse attendue - affichée seulement après correction */}
                            {isCorrected && question.answers && (
                              <div className="bg-muted rounded-lg p-3 text-sm mb-4 border-l-4 border-foreground/30">
                                <p className="font-semibold mb-2 text-foreground">✓ Réponse attendue:</p>
                                <p className="text-foreground/80">{question.answers}</p>
                              </div>
                            )}
                            
                            {/* Explication - affichée seulement après correction */}
                            {isCorrected && question.explanation && (
                              <div className="bg-accent/10 dark:bg-accent/5 rounded-lg p-3 text-xs border-l-4 border-accent">
                                <p className="font-semibold mb-2 text-accent-foreground">💡 Explication:</p>
                                <p className="text-accent-foreground/80">{question.explanation}</p>
                              </div>
                            )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
      </ScrollArea>
    </div>
  )
}

