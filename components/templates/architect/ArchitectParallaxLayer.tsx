'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import type { ArchitectMotionIntensity } from '@/types/public-site'

type ArchitectParallaxLayerProps = {
  className?: string
  speed?: number
  opacity?: number
  intensity?: ArchitectMotionIntensity
}

export default function ArchitectParallaxLayer({
  className = '',
  speed = 0.16,
  opacity = 1,
  intensity = 'medium',
}: ArchitectParallaxLayerProps) {
  const { scrollY } = useScroll()
  const intensityFactor = intensity === 'subtle' ? 0.75 : intensity === 'high' ? 1.5 : 1
  const y = useTransform(scrollY, (value) => value * speed * intensityFactor)

  return (
    <motion.div
      aria-hidden
      className={className}
      style={{
        opacity,
        y,
        willChange: 'transform',
      }}
    />
  )
}
