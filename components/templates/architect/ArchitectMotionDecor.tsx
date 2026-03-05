'use client'

import { motion } from 'framer-motion'
import type { ArchitectMotionIntensity } from '@/types/public-site'

type ArchitectMotionDecorProps = {
  showGridLines: boolean
  showShapes: boolean
  intensity: ArchitectMotionIntensity
  lineColor: string
  shapeColor: string
}

export default function ArchitectMotionDecor({
  showGridLines,
  showShapes,
  intensity,
  lineColor,
  shapeColor,
}: ArchitectMotionDecorProps) {
  const intensityFactor = intensity === 'subtle' ? 0.85 : intensity === 'high' ? 1.4 : 1
  const baseDuration = 18 / intensityFactor

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {showGridLines ? (
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '46px 46px',
            mixBlendMode: 'screen',
          }}
          animate={{ backgroundPosition: ['0px 0px', '46px 24px', '0px 0px'] }}
          transition={{ duration: baseDuration * 3.2, repeat: Infinity, ease: 'linear' }}
        />
      ) : null}

      {showShapes ? (
        <>
          <motion.div
            className="absolute -left-14 top-20 h-40 w-40 border"
            style={{ borderColor: shapeColor }}
            animate={{ x: [0, 26, 0], y: [0, -18, 0], rotate: [0, 9, 0] }}
            transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-8 top-28 h-28 w-28 rounded-full border"
            style={{ borderColor: shapeColor }}
            animate={{ x: [0, -20, 0], y: [0, 14, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: baseDuration * 1.25, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="absolute left-[8%] top-[72%] h-px w-36"
            style={{ backgroundColor: lineColor }}
            animate={{ scaleX: [0.5, 1, 0.5], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: baseDuration * 0.9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="absolute right-[14%] top-[22%] h-px w-44"
            style={{ backgroundColor: lineColor }}
            animate={{ scaleX: [1, 0.5, 1], opacity: [1, 0.35, 1] }}
            transition={{ duration: baseDuration * 1.1, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      ) : null}
    </div>
  )
}
