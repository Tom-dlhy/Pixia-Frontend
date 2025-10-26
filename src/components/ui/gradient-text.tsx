'use client'

import * as React from 'react'
import { motion, type Transition } from 'framer-motion'
import { cn } from '~/lib/utils'

type GradientTextProps = React.ComponentProps<'span'> & {
  text: string
  gradient?: string
  neon?: boolean
  transition?: Transition
}

function GradientText({
  text,
  className,
  gradient = 'linear-gradient(90deg, rgba(74,222,128,0.8) 0%, rgba(34,197,94,0.8) 25%, rgba(21,128,61,0.8) 50%, rgba(34,197,94,0.8) 75%, rgba(74,222,128,0.8) 100%)',
  neon = false,
  transition = { duration: 3, repeat: Infinity, ease: 'linear' },
  ...props
}: GradientTextProps) {
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    setHydrated(true)
  }, [])

  if (!hydrated) {
    return <span className={cn('opacity-0 select-none', className)}>{text}</span>
  }

  const baseStyle: React.CSSProperties = { backgroundImage: gradient }

  return (
    <span data-slot="gradient-text" className={cn('relative inline-block', className)} {...props}>
      <motion.span
        className="m-0 text-transparent bg-clip-text bg-[length:200%_100%]"
        style={baseStyle}
        animate={{ backgroundPositionX: ['0%', '200%'] }}
        transition={transition}
      >
        {text}
      </motion.span>

      {neon && (
        <motion.span
          className="m-0 absolute top-0 left-0 text-transparent bg-clip-text blur-[8px] mix-blend-plus-lighter bg-[length:200%_100%]"
          style={baseStyle}
          animate={{ backgroundPositionX: ['0%', '200%'] }}
          transition={transition}
        >
          {text}
        </motion.span>
      )}
    </span>
  )
}

export { GradientText, type GradientTextProps }
