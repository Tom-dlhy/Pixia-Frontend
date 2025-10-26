import { useCallback, useEffect, useRef, useState } from "react"

interface UseSpeechRecognitionOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
}

interface UseSpeechRecognitionReturn {
  transcript: string
  interimTranscript: string
  isListening: boolean
  isSupported: boolean
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  error: string | null
}

const SpeechRecognition =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    language = "fr-FR",
    continuous = true,  
    interimResults = true,
  } = options

  const recognition = useRef<InstanceType<typeof SpeechRecognition> | null>(null)
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSupported = SpeechRecognition !== null

  useEffect(() => {
    if (!isSupported || recognition.current) return

    recognition.current = new SpeechRecognition()
    const instance = recognition.current

    instance.continuous = continuous
    instance.interimResults = interimResults
    instance.language = language

    instance.onresult = (event: any) => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }

      let interim = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcriptSegment + " ")
        } else {
          interim += transcriptSegment
        }
      }

      setInterimTranscript(interim)

      if (event.results[event.results.length - 1].isFinal) {
        silenceTimeoutRef.current = setTimeout(() => {
          if (instance) {
            try {
              instance.stop()
            } catch (e) {
              // Ignore errors 
            }
          }
        }, 3000)
      }
    }

    instance.onerror = (event: any) => {
      const errorMessages: Record<string, string> = {
        "no-speech": "Aucun son détecté. Veuillez réessayer.",
        "audio-capture": "Aucun microphone détecté.",
        "network": "Erreur réseau. Veuillez vérifier votre connexion.",
        "not-allowed": "Accès au microphone refusé.",
      }

      const message =
        errorMessages[event.error] ||
        `Erreur: ${event.error}`

      setError(message)
      setIsListening(false)
    }

    instance.onend = () => {
      setIsListening(false)
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
    }

    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
      if (instance) {
        try {
          instance.stop()
        } catch (e) {
          // Ignore errors 
        }
      }
    }
  }, [isSupported, continuous, interimResults, language])

  const startListening = useCallback(() => {
    if (!isSupported || !recognition.current) return
    setError(null)
    setInterimTranscript("")
    recognition.current.start()
    setIsListening(true)
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (!isSupported || !recognition.current) return
    recognition.current.stop()
    setIsListening(false)
  }, [isSupported])

  const resetTranscript = useCallback(() => {
    setTranscript("")
    setInterimTranscript("")
    setError(null)
  }, [])

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error,
  }
}
