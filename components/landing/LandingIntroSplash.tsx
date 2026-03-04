'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export default function LandingIntroSplash() {
  const t = useTranslations('loading')
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const holdTimer = window.setTimeout(() => {
      setFadeOut(true)
    }, 700)

    const hideTimer = window.setTimeout(() => {
      setVisible(false)
    }, 980)

    return () => {
      window.clearTimeout(holdTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 z-[100] grid place-items-center bg-[#0b0b0b] px-4 transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111111]/80 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-[#0b0b0b]">
          <Image src="/loom-mark.svg" alt="Loom" width={28} height={28} priority />
        </div>
        <p className="text-lg font-bold tracking-tight text-white">LOOM</p>
        <p className="mt-2 text-sm text-[#888888]">{t('preparingExperience')}</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#0067b0]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#0067b0]/75 [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#0067b0]/50 [animation-delay:240ms]" />
        </div>
      </div>
    </div>
  )
}
