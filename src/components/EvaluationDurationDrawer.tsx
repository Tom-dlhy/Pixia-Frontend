"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Minus, Plus } from "lucide-react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer"
import { Button } from "~/components/ui/button"
import { Slider } from "~/components/ui/slider"
import { cn } from "~/lib/utils"

interface EvaluationDurationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (duration: number) => void
  onCancel?: () => void 
}


/* =========================================================
   VERSION 1 — SLIDER
========================================================= */
export function EvaluationDurationDrawerSlider({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: EvaluationDurationDrawerProps) {
  const [duration, setDuration] = React.useState(30)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(
          "w-full max-w-none bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl text-white",
          "rounded-t-3xl p-6 flex flex-col gap-6"
        )}
      >
        <div className="mx-auto w-full max-w-3xl">
          {/* --- HEADER --- */}
          <DrawerHeader className="text-center space-y-1">
            <DrawerTitle className="text-2xl font-semibold text-center">
              Durée de l’évaluation
            </DrawerTitle>
            <DrawerDescription className="text-gray-300 text-center">
              Choisis le temps que tu veux allouer
            </DrawerDescription>
          </DrawerHeader>

          {/* --- VALEUR + SLIDER --- */}
          <div className="p-6 flex flex-col items-center gap-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={duration}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative overflow-visible px-[0.1em]
                text-8xl font-extrabold tracking-tighter select-none
                bg-gradient-to-b from-white/85 via-white/65 to-white/35
                bg-clip-text text-transparent
                [text-shadow:_0_1px_4px_rgba(255,255,255,0.05),_0_4px_20px_rgba(255,255,255,0.08)]
                mix-blend-screen"
              >
                {duration}
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm uppercase text-white/70 tracking-widest"
            >
              minutes d’évaluation
            </motion.div>

            <Slider
              value={[duration]}
              min={1}
              max={120}
              step={10}
              onValueChange={(v) => setDuration(v[0])}
              className="w-[80%]"
            />
          </div>

          {/* --- FOOTER --- */}
          <DrawerFooter className="flex flex-col items-center gap-3 mt-6">
            {/* --- Bouton Commencer --- */}
            <Button
              className="w-full max-w-sm mx-auto h-11 rounded-xl 
              relative overflow-hidden 
              bg-white/10 backdrop-blur-2xl border border-white/25 
              text-white font-medium
              shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]
              transition-all duration-300 ease-out
              hover:bg-white/20 hover:border-white/30
              before:absolute before:inset-0 
              before:bg-gradient-to-b before:from-white/30 before:to-transparent 
              before:opacity-30 before:pointer-events-none"
              onClick={() => {
                onConfirm(duration)
                onOpenChange(false)
              }}
            >
              Commencer ({duration} min)
            </Button>

            {/* --- Bouton Annuler avec effet destructif en hover --- */}
            <DrawerClose asChild>
              <Button
                variant="outline"
                onClick={() => {
                  if (onCancel) onCancel()
                }}

                className="w-full max-w-sm mx-auto rounded-xl font-medium
                text-white/85 border border-white/20 backdrop-blur-xl
                bg-gradient-to-b from-white/10 via-white/5 to-transparent
                shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),_0_2px_10px_rgba(0,0,0,0.2)]
                transition-all duration-500 ease-out
                hover:text-red-200 hover:border-red-300/20
                hover:from-red-500/30 hover:via-red-500/20 hover:to-red-500/10
                hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),_0_2px_10px_rgba(0,0,0,0.25)]"
              >
                Annuler
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

/* =========================================================
   VERSION 2 — MOVE GOAL-LIKE
========================================================= */
export function EvaluationDurationDrawerButtons({
  open,
  onOpenChange,
  onConfirm,
  onCancel, // ✅ ajout ici
}: EvaluationDurationDrawerProps) {
  const [duration, setDuration] = React.useState(30)

  const adjust = (delta: number) =>
    setDuration((prev) => Math.min(120, Math.max(10, prev + delta)))

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(
          "w-full max-w-none bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl text-white",
          "rounded-t-3xl p-6 flex flex-col gap-6"
        )}
      >
        <div className="mx-auto w-full max-w-3xl">
          {/* --- TITRE --- */}
          <DrawerHeader className="text-center space-y-1">
            <DrawerTitle className="text-2xl font-semibold text-center">
              Durée de l’évaluation
            </DrawerTitle>
            <DrawerDescription className="text-gray-300 text-center">
              Choisis le temps que tu veux allouer
            </DrawerDescription>
          </DrawerHeader>

          {/* --- CHIFFRE + BOUTONS --- */}
          <div className="p-6 flex flex-col items-center">
            <div className="flex items-center justify-center gap-10">
              {/* Bouton - */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="h-14 w-14 rounded-full 
                bg-white/10 backdrop-blur-lg border border-white/30 
                shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_4px_10px_rgba(0,0,0,0.2)] 
                text-white/90 flex items-center justify-center 
                hover:bg-white/20 transition-all"
                onClick={() => adjust(-10)}
                disabled={duration <= 10}
              >
                <Minus className="h-5 w-5" />
              </motion.button>

            {/* --- CHIFFRE AVEC EFFET VERRE APPLE PARFAIT --- */}
            <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [1, 0.95, 1] }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="relative flex items-center justify-center overflow-visible px-[0.1em]
                text-8xl font-extrabold tracking-tighter select-none
                bg-gradient-to-b from-white/85 via-white/65 to-white/35
                bg-clip-text text-transparent
                [text-shadow:_0_1px_4px_rgba(255,255,255,0.05),_0_4px_20px_rgba(255,255,255,0.08)]
                mix-blend-screen"
            >
                {duration}
            </motion.div>

              {/* Bouton + */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="h-14 w-14 rounded-full 
                bg-white/10 backdrop-blur-lg border border-white/30 
                shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_4px_10px_rgba(0,0,0,0.2)] 
                text-white/90 flex items-center justify-center 
                hover:bg-white/20 transition-all"
                onClick={() => adjust(10)}
                disabled={duration >= 120}
              >
                <Plus className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Label */}
            <motion.div
              key={`text-${duration}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm uppercase text-white/70 mt-4 tracking-widest text-center"
            >
              minutes d’évaluation
            </motion.div>
          </div>

{/* --- FOOTER --- */}
<DrawerFooter className="flex flex-col items-center gap-3 mt-6">
  {/* --- Bouton Commencer --- */}
  <Button
      variant="outline"
      className="w-full max-w-sm mx-auto rounded-xl font-medium
      text-white/85 border border-white/20 backdrop-blur-xl
      bg-gradient-to-b from-white/10 via-white/5 to-transparent
      shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),_0_2px_10px_rgba(0,0,0,0.2)]
      hover:from-white/15 hover:via-white/10 hover:to-white/5
      transition-all duration-300"
    onClick={() => {
      onConfirm(duration)
      onOpenChange(false)
    }}
  >
    Commencer ({duration} min)
  </Button>

{/* --- Bouton Destructif (rouge glassmorphic Apple-like) --- */}
<DrawerClose asChild>
  <Button
    variant="outline"
    onClick={() => {
      if (onCancel) onCancel()
    }}
    className="w-full max-w-sm mx-auto rounded-xl font-medium
    text-white/85 border border-white/20 backdrop-blur-xl
    bg-gradient-to-b from-white/10 via-white/5 to-transparent
    shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),_0_2px_10px_rgba(0,0,0,0.2)]
    transition-all duration-500 ease-out
    hover:text-red-200 hover:border-red-300/20
    hover:from-red-500/30 hover:via-red-500/20 hover:to-red-500/10
    hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),_0_2px_10px_rgba(0,0,0,0.25)]"
  >
    Annuler
  </Button>
</DrawerClose>


</DrawerFooter>

        </div>
      </DrawerContent>
    </Drawer>
  )
}
