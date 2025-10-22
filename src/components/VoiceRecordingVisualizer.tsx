"use client"

import { useEffect, useRef, useCallback } from "react"
import { Mic, MicOff } from "lucide-react"
import { cn } from "~/lib/utils"

interface VoiceRecordingVisualizerProps {
  isListening: boolean
  interimTranscript: string
  transcript: string
  error?: string | null
  isDark: boolean
}

export function VoiceRecordingVisualizer({
  isListening,
  interimTranscript,
  transcript,
  error,
  isDark,
}: VoiceRecordingVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // 🎵 Fonction de visualisation - définie en premier
  const drawVisualization = useCallback(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current

    if (!canvas || !analyser) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw)

      analyser.getByteFrequencyData(dataArray)

      // Effacer le canvas
      ctx.fillStyle = isDark ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Dessiner les barres
      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height

        // Gradient de couleur corail
        const hue = (i / bufferLength) * 60 // Teintes corail/rose
        ctx.fillStyle = `hsl(${hue}, 100%, 55%)`
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }
    }

    draw()
  }, [isDark])

  // 🎨 Initialiser l'audio context et commencer la visualisation
  useEffect(() => {
    if (!isListening) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      return
    }

    const initAudio = async () => {
      try {
        // Accès au microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream

        // Créer l'audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        audioContextRef.current = audioContext

        const analyser = audioContext.createAnalyser()
        analyserRef.current = analyser

        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyser)

        analyser.fftSize = 2048
        drawVisualization()
      } catch (err) {
        console.error("Erreur accès microphone:", err)
      }
    }

    initAudio()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isListening, drawVisualization])

  // 📝 Contenu à afficher
  const displayText = interimTranscript || transcript
  const isError = !!error

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 🎤 Visualiseur audio */}
      {isListening && (
        <div className="w-full">
          <canvas
            ref={canvasRef}
            width={300}
            height={60}
            className={cn(
              "w-full rounded-lg",
              isDark ? "bg-neutral-900/50" : "bg-gray-100/50"
            )}
          />
        </div>
      )}

      {/* 📝 Transcription */}
      {displayText && (
        <div
          className={cn(
            "p-3 rounded-lg text-sm leading-relaxed",
            isListening
              ? isDark
                ? "bg-rose-500/10 text-rose-100"
                : "bg-rose-100/50 text-rose-900"
              : isDark
              ? "bg-green-500/10 text-green-100"
              : "bg-green-100/50 text-green-900"
          )}
        >
          {displayText}
          {isListening && (
            <span className="animate-pulse ml-1">▌</span>
          )}
        </div>
      )}

      {/* ❌ Messages d'erreur */}
      {isError && (
        <div className="p-3 rounded-lg text-sm bg-red-500/10 text-red-100">
          {error}
        </div>
      )}

      {/* 🎙️ État du microphone */}
      {isListening && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
          <Mic className="h-3 w-3" />
          En écoute...
        </div>
      )}
    </div>
  )
}
