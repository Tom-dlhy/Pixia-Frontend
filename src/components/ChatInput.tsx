"use client"

import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { Mic, Paperclip, Send, X } from "lucide-react"
import { Textarea } from "~/components/ui/textarea"
import { Button } from "~/components/ui/button"
import { BackgroundGradient } from "~/components/ui/background-gradient"
import { cn } from "~/lib/utils"
import { useCourseType } from "~/context/CourseTypeContext"
import { getCourseAccent } from "~/utils/courseTypeStyles"
import { useSpeechRecognition } from "~/hooks/useSpeechRecognition"
import { TextGenerateEffect } from "~/components/ui/text-generate-effect"

export type ChatInputProps = {
  value: string
  onChange: (nextValue: string) => void
  onSubmit: () => void | Promise<void>
  queuedFiles?: File[]
  onFilesSelected?: (files: File[]) => void
  onRemoveAttachment?: (index: number) => void
  isSending?: boolean
  disableAttachments?: boolean
  className?: string
  placeholder?: string
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  queuedFiles = [],
  onFilesSelected,
  onRemoveAttachment,
  isSending = false,
  disableAttachments = false,
  className,
  placeholder = "Écris ton message...",
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const { courseType } = useCourseType()
  const accentKey = courseType === "deep" ? "none" : courseType
  const accent = useMemo(() => getCourseAccent(accentKey), [accentKey])

  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return false
    return document.documentElement.classList.contains("dark")
  })

  const {
    transcript,
    interimTranscript,
    isListening,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError,
  } = useSpeechRecognition({
    language: "fr-FR",
    continuous: false,
    interimResults: true,
  })

  useEffect(() => {
    if (typeof document === "undefined") return
    const checkDark = () =>
      document.documentElement.classList.contains("dark")

    const observer = new MutationObserver(() => {
      setIsDark(checkDark())
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isListening && transcript && !isSending) {
      onChange(value + transcript)
      resetTranscript()
    }
  }, [isListening, transcript, value, isSending, onChange, resetTranscript])

  const hasContent = value.trim().length > 0 || queuedFiles.length > 0
  const actionIcon = hasContent ? (
    <Send className="h-5 w-5" />
  ) : (
    <Mic className="h-5 w-5" />
  )

  const gradientColors = useMemo<[string, string, string, string]>(() => {
    switch (courseType) {
      case "exercice":
        return ["#93c5fd", "#60a5fa", "#3b82f6", "#1e40af"] 
      case "cours":
        return ["#5ef1c2", "#34e7a6", "#1de9b6", "#00c4b4"] 
      case "deep":
        return ["#c4b5fd", "#a78bfa", "#8b5cf6", "#7c3aed"] 
      case "none":
        return ["#f5f5f5", "#e5e7eb", "#d1d5db", "#9ca3af"] 
      default:
        return ["#93c5fd", "#5eead4", "#34d399", "#2563eb"]
    }
  }, [courseType])

  const backgroundColor = isDark ? "bg-neutral-900/40" : "bg-gray-200/30"
  const backgroundColorNormal = isDark ? "bg-neutral-900" : "bg-gray-200"

  const textColor = isDark
    ? "text-white placeholder:text-white/60"
    : "text-zinc-900 placeholder:text-zinc-500"
  const borderColor = isDark ? "border-white/10" : "border-zinc-200"

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!hasContent || isSending) return
    onSubmit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.key === "Enter" || event.code === "NumpadEnter") && !event.shiftKey) {
      event.preventDefault()
      if (!hasContent || isSending) return
      onSubmit()
    }
  }

  const handleAttachmentClick = () => {
    if (!disableAttachments) fileInputRef.current?.click()
  }

  const handleMicClick = () => {
    if (!isSpeechSupported) {
      console.warn("Speech Recognition not supported")
      return
    }
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      startListening()
    }
  }

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!onFilesSelected) return
    const files = event.target.files
    if (!files?.length) return
    onFilesSelected(Array.from(files))
    event.target.value = ""
  }

  const formContent = (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 px-4 py-3 relative z-[2]"
    >
      {isListening && interimTranscript && (
        <TextGenerateEffect
          words={interimTranscript}
          duration={0.1}
          staggerDelay={0.02}
          filter={false}
          className="text-sm font-normal text-foreground"
        />
      )}

      {queuedFiles.length > 0 && (
        <div
          className={cn(
            "flex flex-wrap gap-2 text-xs",
            isDark ? "text-white/70" : "text-zinc-600"
          )}
        >
          {queuedFiles.map((file, index) => (
            <span
              key={`${file.name}-${index}`}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1 backdrop-blur-sm",
                isDark ? "bg-white/10" : "bg-zinc-200/60"
              )}
            >
              <Paperclip className="h-3.5 w-3.5" />
              <span className="max-w-[120px] truncate">{file.name}</span>
              {onRemoveAttachment && (
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(index)}
                  className={cn(
                    "rounded-full p-0.5 transition",
                    isDark
                      ? "text-white/60 hover:bg-white/10"
                      : "text-zinc-700 hover:bg-zinc-300/40"
                  )}
                  aria-label={`Retirer ${file.name}`}
                  disabled={isSending}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        {!disableAttachments && (
          <Button
            type="button"
            onClick={handleAttachmentClick}
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 shrink-0 rounded-full transition",
              isDark
                ? "text-white/70 hover:text-white hover:bg-white/10"
                : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200/60"
            )}
            aria-label="Ajouter une pièce jointe"
            disabled={isSending || !onFilesSelected || isListening}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        )}

        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onInput={() => {
            const el = textareaRef.current
            if (!el) return
            el.style.height = "auto"
            el.style.height = `${Math.min(el.scrollHeight, 192)}px`
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={isSending || isListening}
          className={cn(
            "w-full min-h-[44px] max-h-48 resize-none bg-transparent border-none px-2 py-1 text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 overflow-y-auto",
            textColor
          )}
        />

        {isSpeechSupported && !hasContent && !isListening && (
          <Button
            type="button"
            onClick={handleMicClick}
            disabled={isSending}
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 shrink-0 rounded-full transition",
              isDark
                ? "text-white/70 hover:text-white hover:bg-white/10"
                : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200/60"
            )}
            aria-label="Enregistrement vocal"
          >
            <Mic className="h-5 w-5" />
          </Button>
        )}

        {isListening && (
          <Button
            type="button"
            onClick={handleMicClick}
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 shrink-0 rounded-full transition animate-pulse bg-red-500/20",
              isDark
                ? "text-red-300 hover:bg-red-500/30"
                : "text-red-600 hover:bg-red-500/30"
            )}
            aria-label="Arrêter l'enregistrement"
          >
            <Mic className="h-5 w-5" />
          </Button>
        )}

        {(hasContent || isListening) && (
          <Button
            type="submit"
            disabled={isSending || isListening}
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 shrink-0 rounded-full transition",
              isDark
                ? "text-white/80 hover:text-white hover:bg-white/10"
                : "text-zinc-800 hover:text-zinc-950 hover:bg-zinc-200/60"
            )}
            aria-label="Envoyer le message"
          >
            <Send className="h-5 w-5" />
          </Button>
        )}
      </div>

      {onFilesSelected && (
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleFilesChange}
        />
      )}
    </form>
  )

  return (
    <div className={cn("w-full relative", className)}>
      {courseType === "deep" ? (
        <div
          className={cn(
            "relative z-[1] rounded-[20px] border backdrop-blur-md transition-colors duration-500",
            backgroundColor,
            "border-violet-500/60 dark:border-violet-400/50"
          )}
        >
          {formContent}
        </div>
      ) : (
        <BackgroundGradient className="rounded-[22px] w-full p-[0.5px]" colors={gradientColors}>
          <div
            className={cn(
              "relative z-[1] rounded-[20px] border backdrop-blur-md transition-colors duration-500",
              backgroundColorNormal,
              borderColor
            )}
          >
            {formContent}
          </div>
        </BackgroundGradient>
      )}
    </div>
  )
}
