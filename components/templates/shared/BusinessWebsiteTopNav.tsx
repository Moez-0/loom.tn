'use client'

import { useState } from 'react'
import Link from 'next/link'
import BusinessLocaleSwitcher from '@/components/templates/shared/BusinessLocaleSwitcher'
import { useTranslations } from 'next-intl'

type Locale = 'en' | 'fr' | 'ar'

type NavLink = {
  key: string
  href: string
  label: string
}

type BusinessWebsiteTopNavProps = {
  businessName: string
  businessLogoUrl?: string | null
  reserveHref: string
  navCtaLabel: string
  buttonRadiusClass: string
  accentColor: string
  navBackgroundColor: string
  borderColor: string
  textColor: string
  mutedTextColor: string
  surfaceColor: string
  locale: Locale
  links: NavLink[]
}

export default function BusinessWebsiteTopNav({
  businessName,
  businessLogoUrl,
  reserveHref,
  navCtaLabel,
  buttonRadiusClass,
  accentColor,
  navBackgroundColor,
  borderColor,
  textColor,
  mutedTextColor,
  surfaceColor,
  locale,
  links,
}: BusinessWebsiteTopNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const t = useTranslations('common')

  return (
    <nav className="sticky top-0 z-30 border-b backdrop-blur" style={{ borderColor, backgroundColor: navBackgroundColor }}>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-3">
          {businessLogoUrl ? <img src={businessLogoUrl} alt={businessName} className="h-8 w-8 rounded object-cover" /> : null}
          <span className="text-sm font-semibold tracking-wide" style={{ color: textColor }}>{businessName}</span>
        </a>

        <div className="hidden items-center gap-6 text-sm md:flex" style={{ color: mutedTextColor }}>
          {links.map((link) => (
            <a key={link.key} href={link.href} className="transition" style={{ color: mutedTextColor }}>
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <BusinessLocaleSwitcher
            currentLocale={locale}
            accentColor={accentColor}
            borderColor={borderColor}
            backgroundColor={navBackgroundColor}
            textColor={textColor}
            mutedTextColor={mutedTextColor}
          />
          <Link
            href={reserveHref}
            className={`${buttonRadiusClass} px-4 py-2 text-sm font-semibold text-white`}
            style={{ backgroundColor: accentColor }}
          >
            {navCtaLabel}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((previous) => !previous)}
          className="inline-flex items-center justify-center rounded-md border p-2 md:hidden"
          style={{ borderColor, color: textColor }}
          aria-label={t('toggleMenu')}
          aria-expanded={mobileOpen}
        >
          <span className="text-lg leading-none">{mobileOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t px-4 py-3 md:hidden" style={{ borderColor, backgroundColor: surfaceColor }}>
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <a
                key={`mobile-${link.key}`}
                href={link.href}
                className="rounded-md border px-3 py-2 text-sm"
                style={{ borderColor, backgroundColor: navBackgroundColor, color: textColor }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <BusinessLocaleSwitcher
              currentLocale={locale}
              accentColor={accentColor}
              borderColor={borderColor}
              backgroundColor={navBackgroundColor}
              textColor={textColor}
              mutedTextColor={mutedTextColor}
            />
            <Link
              href={reserveHref}
              className={`${buttonRadiusClass} px-4 py-2 text-sm font-semibold text-white`}
              style={{ backgroundColor: accentColor }}
              onClick={() => setMobileOpen(false)}
            >
              {navCtaLabel}
            </Link>
          </div>
        </div>
      ) : null}
    </nav>
  )
}
