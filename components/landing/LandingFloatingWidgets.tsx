'use client'

import { useEffect, useMemo, useState } from 'react'
import { MessageCircle, ShieldCheck, Sparkles, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

type ChatTopic = 'pricing' | 'setup' | 'support'

const COOKIE_KEY = 'loom-cookie-consent'

export default function LandingFloatingWidgets() {
  const t = useTranslations('landing.widgets')
  const [cookieVisible, setCookieVisible] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [activeTopic, setActiveTopic] = useState<ChatTopic>('pricing')

  useEffect(() => {
    const stored = window.localStorage.getItem(COOKIE_KEY)
    setCookieVisible(stored !== 'accepted')
  }, [])

  const response = useMemo(() => {
    return t(`chat.responses.${activeTopic}`)
  }, [activeTopic, t])

  function acceptCookies() {
    window.localStorage.setItem(COOKIE_KEY, 'accepted')
    setCookieVisible(false)
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[70]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        {cookieVisible ? (
          <section className="pointer-events-auto w-full max-w-md rounded-xl border border-white/10 bg-[#0b0b0b]/95 p-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md border border-[#0067b0]/40 bg-[#0067b0]/15 p-2 text-[#0067b0]">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{t('cookie.title')}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#b8b8b8]">{t('cookie.description')}</p>
              </div>
              <button
                type="button"
                onClick={() => setCookieVisible(false)}
                aria-label={t('cookie.close')}
                className="rounded-md border border-white/10 p-1 text-[#8c8c8c] transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={acceptCookies}
                className="rounded-md bg-[#0067b0] px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-600"
              >
                {t('cookie.accept')}
              </button>
              <button
                type="button"
                onClick={() => setCookieVisible(false)}
                className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                {t('cookie.essentialOnly')}
              </button>
            </div>
          </section>
        ) : (
          <div className="hidden sm:block" />
        )}

        <div className="pointer-events-auto w-full sm:w-auto sm:max-w-sm sm:self-end">
          {chatOpen ? (
            <section className="mb-3 w-full rounded-xl border border-white/10 bg-[#0b0b0b]/95 p-4 shadow-2xl backdrop-blur-xl sm:w-80">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">{t('chat.title')}</p>
                  <p className="mt-1 text-xs text-[#b8b8b8]">{t('chat.subtitle')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  aria-label={t('chat.close')}
                  className="rounded-md border border-white/10 p-1 text-[#8c8c8c] transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTopic('pricing')}
                  className={`rounded-md border px-2 py-1.5 text-[11px] font-semibold transition ${
                    activeTopic === 'pricing'
                      ? 'border-[#0067b0]/60 bg-[#0067b0]/20 text-white'
                      : 'border-white/15 bg-white/5 text-[#d0d0d0] hover:bg-white/10'
                  }`}
                >
                  {t('chat.topics.pricing')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTopic('setup')}
                  className={`rounded-md border px-2 py-1.5 text-[11px] font-semibold transition ${
                    activeTopic === 'setup'
                      ? 'border-[#0067b0]/60 bg-[#0067b0]/20 text-white'
                      : 'border-white/15 bg-white/5 text-[#d0d0d0] hover:bg-white/10'
                  }`}
                >
                  {t('chat.topics.setup')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTopic('support')}
                  className={`rounded-md border px-2 py-1.5 text-[11px] font-semibold transition ${
                    activeTopic === 'support'
                      ? 'border-[#0067b0]/60 bg-[#0067b0]/20 text-white'
                      : 'border-white/15 bg-white/5 text-[#d0d0d0] hover:bg-white/10'
                  }`}
                >
                  {t('chat.topics.support')}
                </button>
              </div>

              <div className="mt-3 rounded-md border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-[#e5e5e5]">
                {response}
              </div>
            </section>
          ) : null}

          <button
            type="button"
            onClick={() => setChatOpen((prev) => !prev)}
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-[#0067b0]/40 bg-[#0067b0] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#0067b0]/30 transition hover:bg-blue-600"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">{t('chat.open')}</span>
            <MessageCircle className="h-4 w-4 sm:hidden" />
          </button>
        </div>
      </div>
    </div>
  )
}
