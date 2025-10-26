'use client'

import { useEffect, useState, useMemo, memo, useCallback, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { ExerciseOutput, isQCM, isOpen } from '~/models/Document'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Checkbox } from '~/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import { QCMQuestion } from '~/models/Document'
import { useDocumentTitle } from '~/context/DocumentTitleContext'
import { cn } from '~/lib/utils'

interface ExerciseViewerProps {
  exercise: ExerciseOutput
}

const MARKDOWN_COMPONENTS = {
  p: ({ node, ...props }: any) => <p className="mb-0" {...props} />,
  strong: ({ node, ...props }: any) => <strong className="font-semibold" {...props} />,
  em: ({ node, ...props }: any) => <em className="italic" {...props} />,
  code: ({ node, ...props }: any) => (
    <code className="bg-muted px-1 py-0.5 rounded text-xs" {...props} />
  ),
}

const REMARK_PLUGINS = [remarkMath]
const REHYPE_PLUGINS = [rehypeKatex]

const MarkdownText = memo(
  function MarkdownText({ text, className = "" }: { text: string; className?: string }) {
    const content = useMemo(
      () => (
        <ReactMarkdown
          remarkPlugins={REMARK_PLUGINS}
          rehypePlugins={REHYPE_PLUGINS}
          components={MARKDOWN_COMPONENTS}
        >
          {text}
        </ReactMarkdown>
      ),
      [text]
    )
    
    return (
      <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
        {content}
      </div>
    )
  },
  (prevProps, nextProps) => {
    return prevProps.text === nextProps.text && prevProps.className === nextProps.className
  }
)

const RadioAnswerOption = memo(function RadioAnswerOption({
  value,
  text,
  isCorrected,
  isCorrect,
  disabled,
}: {
  value: string
  text: string
  isCorrected: boolean
  isCorrect: boolean
  disabled: boolean
}) {
  return (
    <label
      className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-colors ${
        isCorrected
          ? isCorrect
            ? 'bg-green-100/50 dark:bg-green-950/50 hover:bg-green-100/70 dark:hover:bg-green-950/70'
            : 'bg-red-100/50 dark:bg-red-950/50 hover:bg-red-100/70 dark:hover:bg-red-950/70'
          : 'hover:bg-muted/50'
      }`}
    >
      <RadioGroupItem value={value} disabled={disabled} />
      <div className="text-sm flex-1"><MarkdownText text={text} className="!prose-sm" /></div>
      {isCorrected && isCorrect && (
        <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
          ✓ Correct
        </span>
      )}
    </label>
  )
})

const CheckboxAnswerOption = memo(function CheckboxAnswerOption({
  checked,
  onCheckedChange,
  text,
  isCorrected,
  isCorrect,
  disabled,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  text: string
  isCorrected: boolean
  isCorrect: boolean
  disabled: boolean
}) {
  return (
    <label
      className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-colors ${
        isCorrected
          ? isCorrect
            ? 'bg-green-100/50 dark:bg-green-950/50 hover:bg-green-100/70 dark:hover:bg-green-950/70'
            : 'bg-red-100/50 dark:bg-red-950/50 hover:bg-red-100/70 dark:hover:bg-red-950/70'
          : 'hover:bg-muted/50'
      }`}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <div className="text-sm flex-1"><MarkdownText text={text} className="!prose-sm" /></div>
      {isCorrected && isCorrect && (
        <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
          ✓ Correct
        </span>
      )}
    </label>
  )
})

export function ExerciseViewer({ exercise }: ExerciseViewerProps) {
  const { setTitle } = useDocumentTitle()
  
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({})
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({})
  const [correctedQuestions, setCorrectedQuestions] = useState<Record<string, { isCorrect: boolean; showExplanation: boolean }>>({})
  
  const handlersCache = useRef<Map<string, any>>(new Map())
  const isCorrectedRef = useRef<Record<string, boolean>>({})
  
  useEffect(() => {
    isCorrectedRef.current = Object.keys(correctedQuestions).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as Record<string, boolean>)
  }, [correctedQuestions])
  
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

  const handleRadioChange = useCallback((key: string, value: string) => {
    setUserAnswers(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleCheckboxChange = useCallback((key: string, value: string, checked: boolean) => {
    setUserAnswers(prev => {
      const current = (prev[key] as string[]) || []
      if (checked) {
        return { ...prev, [key]: [...current, value] }
      } else {
        return { ...prev, [key]: current.filter(v => v !== value) }
      }
    })
  }, [])

  const handleOpenAnswerChange = useCallback((key: string, value: string) => {
    setOpenAnswers(prev => ({ ...prev, [key]: value }))
  }, [])

  const getRadioChangeHandler = useCallback((questionKey: string) => {
    const cacheKey = `radio_${questionKey}`
    if (!handlersCache.current.has(cacheKey)) {
      handlersCache.current.set(cacheKey, (value: string) => {
        if (!isCorrectedRef.current[questionKey]) {
          handleRadioChange(questionKey, value)
        }
      })
    }
    return handlersCache.current.get(cacheKey)
  }, [handleRadioChange])

  const getCheckboxChangeHandler = useCallback((questionKey: string, answerIdx: string) => {
    const cacheKey = `checkbox_${questionKey}_${answerIdx}`
    if (!handlersCache.current.has(cacheKey)) {
      handlersCache.current.set(cacheKey, (checked: boolean) => {
        if (!isCorrectedRef.current[questionKey]) {
          handleCheckboxChange(questionKey, answerIdx, checked)
        }
      })
    }
    return handlersCache.current.get(cacheKey)
  }, [handleCheckboxChange])

  const handleCheckQCM = (questionKey: string, question: QCMQuestion, isMultiAnswer: boolean) => {
    const userResponse = userAnswers[questionKey]
    
    let isCorrect = false
    
    if (isMultiAnswer) {
      const userSelectedIndices = (userResponse as string[]) || []
      const correctIndices = question.answers
        .map((ans, idx) => ans.is_correct ? String(idx) : null)
        .filter((idx): idx is string => idx !== null)
      
      isCorrect = userSelectedIndices.length === correctIndices.length &&
                  userSelectedIndices.every(idx => correctIndices.includes(idx))
    } else {
      const selectedIndex = String(userResponse ?? '')
      isCorrect = selectedIndex !== '' && question.answers[Number(selectedIndex)]?.is_correct === true
    }
    
    setCorrectedQuestions(prev => ({
      ...prev,
      [questionKey]: { isCorrect, showExplanation: true }
    }))
  }

  const handleCheckOpen = (questionKey: string) => {
    setCorrectedQuestions(prev => ({
      ...prev,
      [questionKey]: { isCorrect: false, showExplanation: true }
    }))
  }

  return (
    <ScrollArea className="flex-1 h-full w-full">
      <div className="space-y-8 pr-4 w-full">
        {exercise.exercises.map((block, blockIdx) => (
              <div key={blockIdx} className="space-y-4">
                {isQCM(block) && (
                  <div className="border border-white/20 dark:border-white/10 rounded-xl p-6 bg-muted/20 hover:bg-muted/30 transition-colors duration-200">
                    <h2 className="text-xl font-bold text-center mb-4 text-foreground">
                      {block.topic}
                    </h2>
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
                            <div className={`flex items-center justify-between px-4 py-3 border-b ${
                              isCorrected
                                ? isAnswerCorrect
                                  ? 'bg-green-600/20 border-green-400'
                                  : 'bg-red-600/20 border-red-400'
                                : 'bg-white/5 dark:bg-white/5 border-white/10'
                            }`}>
                              <MarkdownText text={question.question} className="!prose-sm" />
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
                            
                            <div className="p-4">
                            
                            {isMultiAnswer ? (
                              <div className="space-y-3 mb-4">
                                {question.answers.map((answer, aIdx) => {
                                  const isChecked = ((userAnswers[questionKey] as string[]) || []).includes(String(aIdx))
                                  
                                  return (
                                    <CheckboxAnswerOption
                                      key={aIdx}
                                      checked={isChecked}
                                      onCheckedChange={getCheckboxChangeHandler(questionKey, String(aIdx))}
                                      text={answer.text}
                                      isCorrected={isCorrected}
                                      isCorrect={answer.is_correct}
                                      disabled={isCorrected}
                                    />
                                  )
                                })}
                              </div>
                            ) : (
                              <RadioGroup
                                value={String(userAnswers[questionKey] ?? '')}
                                onValueChange={getRadioChangeHandler(questionKey)}
                                className="mb-4"
                                disabled={isCorrected}
                              >
                                {question.answers.map((answer, aIdx) => (
                                  <RadioAnswerOption
                                    key={aIdx}
                                    value={String(aIdx)}
                                    text={answer.text}
                                    isCorrected={isCorrected}
                                    isCorrect={answer.is_correct}
                                    disabled={isCorrected}
                                  />
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

                {isOpen(block) && (
                  <div className="border border-white/20 dark:border-white/10 rounded-xl p-6 bg-muted/20 hover:bg-muted/30 transition-colors duration-200">
                    <h2 className="text-xl font-bold text-center mb-4 text-foreground">
                      {block.topic}
                    </h2>
                    
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
                            <div className="flex items-center justify-between bg-white/5 dark:bg-white/5 px-4 py-3 border-b border-white/10">
                              <MarkdownText text={question.question} className="!prose-sm" />
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
                            
                            <div className="p-4">
                            
                            <Textarea
                              placeholder="Entrez votre réponse ici..."
                              value={openAnswers[questionKey] ?? ''}
                              onChange={(e) => handleOpenAnswerChange(questionKey, e.target.value)}
                              disabled={isCorrected}
                              className="mb-4 min-h-[100px]"
                            />
                            
                            {isCorrected && question.answers && (
                              <div className="bg-muted rounded-lg p-3 text-sm mb-4 border-l-4 border-foreground/30">
                                <p className="font-semibold mb-2 text-foreground">✓ Réponse attendue:</p>
                                <p className="text-foreground/80">{question.answers}</p>
                              </div>
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
              </div>
            ))}
          </div>
      </ScrollArea>
  )
}

