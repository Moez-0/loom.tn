'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'

type Locale = 'en' | 'fr' | 'ar'

type BusinessLocaleSwitcherProps = {
  currentLocale: Locale
  accentColor?: string | null
}

const locales: Array<{ value: Locale; label: string }> = [
  { value: 'en', label: 'EN' },
  { value: 'fr', label: 'FR' },
  { value: 'ar', label: 'AR' },
]

export default function BusinessLocaleSwitcher({ currentLocale, accentColor }: BusinessLocaleSwitcherProps) {
  const router = useRouter()
  const activeColor = useMemo(() => accentColor || '#111827', [accentColor])

  function handleChange(locale: Locale) {
    document.cookie = `NEXT_LOCALE=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`
    router.refresh()
  }

  return (
    <div className="inline-flex items-center rounded-md border border-zinc-300 bg-white p-1">
      {locales.map((locale) => {
        const active = locale.value === currentLocale

        return (
          <button
            key={locale.value}
            type="button"
            onClick={() => handleChange(locale.value)}
            className="rounded px-2.5 py-1 text-xs font-semibold transition"
            style={
              active
                ? {
                    backgroundColor: activeColor,
                    color: '#ffffff',
                  }
                : {
                    color: '#52525b',
                  }
            }
            aria-pressed={active}
          >
            {locale.label}
          </button>
        )
      })}
    </div>
  )
}
