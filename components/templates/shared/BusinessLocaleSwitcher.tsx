'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Languages } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Locale = 'en' | 'fr' | 'ar'

type BusinessLocaleSwitcherProps = {
  currentLocale: Locale
  accentColor?: string | null
  borderColor?: string
  backgroundColor?: string
  textColor?: string
  mutedTextColor?: string
}

const locales: Array<{ value: Locale; label: string }> = [
  { value: 'en', label: 'EN' },
  { value: 'fr', label: 'FR' },
  { value: 'ar', label: 'AR' },
]

export default function BusinessLocaleSwitcher({
  currentLocale,
  accentColor,
  borderColor,
  backgroundColor,
  textColor,
  mutedTextColor,
}: BusinessLocaleSwitcherProps) {
  const router = useRouter()
  const t = useTranslations('common')
  const [open, setOpen] = useState(false)
  const activeColor = useMemo(() => accentColor || '#111827', [accentColor])
  const resolvedBorder = borderColor || '#d4d4d8'
  const resolvedBackground = backgroundColor || '#ffffff'
  const resolvedText = textColor || '#111827'
  const resolvedMuted = mutedTextColor || '#52525b'

  function handleChange(locale: Locale) {
    document.cookie = `NEXT_LOCALE=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-sm border text-xs font-semibold"
        style={{ borderColor: resolvedBorder, backgroundColor: resolvedBackground, color: resolvedText }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('chooseLanguage')}
      >
        <Languages className="h-4 w-4" aria-hidden="true" />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+0.4rem)] z-30 min-w-[92px] rounded-md border p-1 shadow-lg"
          style={{ borderColor: resolvedBorder, backgroundColor: resolvedBackground }}
          role="menu"
        >
          {locales.map((locale) => {
            const active = locale.value === currentLocale

            return (
              <button
                key={locale.value}
                type="button"
                onClick={() => handleChange(locale.value)}
                className="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-xs font-semibold"
                style={
                  active
                    ? {
                        backgroundColor: activeColor,
                        color: '#ffffff',
                      }
                    : {
                        color: resolvedMuted,
                      }
                }
                aria-pressed={active}
                role="menuitem"
              >
                <span>{locale.value.toUpperCase()}</span>
                {active ? <span>✓</span> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
