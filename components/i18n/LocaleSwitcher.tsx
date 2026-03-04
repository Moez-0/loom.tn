'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

type Locale = 'en' | 'fr' | 'ar'

type LocaleSwitcherProps = {
  currentLocale: Locale
}

const locales: Locale[] = ['en', 'fr', 'ar']

export default function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const router = useRouter()
  const t = useTranslations('common')
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (!menuRef.current) {
        return
      }
      if (!menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function handleChange(locale: Locale) {
    setIsOpen(false)
    document.cookie = `NEXT_LOCALE=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`
    router.refresh()
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-md border border-loom-border bg-loom-surface px-3 py-1.5 text-[0.70rem] uppercase tracking-[0.12em] text-loom-muted hover:text-white"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span>{t('language')}</span>
        <span className="font-semibold text-white">{t(currentLocale)}</span>
        <svg className={`h-3.5 w-3.5 text-loom-faint transition ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-50 mt-2 min-w-[160px] rounded-md border border-loom-border bg-loom-surface p-1 shadow-2xl" role="menu">
          {locales.map((locale) => {
            const active = currentLocale === locale
            return (
              <button
                key={locale}
                type="button"
                onClick={() => handleChange(locale)}
                className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-[0.75rem] uppercase tracking-[0.12em] transition ${
                  active ? 'bg-loom-accent text-white' : 'text-loom-muted hover:bg-loom-surface-2 hover:text-white'
                }`}
                role="menuitem"
              >
                <span>{t(locale)}</span>
                {active ? <span>✓</span> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
