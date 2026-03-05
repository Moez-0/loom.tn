import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import BusinessWebsiteTopNav from '@/components/templates/shared/BusinessWebsiteTopNav'
import { usesAppointmentTerminology } from '@/lib/business-type-config'
import type { PublicSiteSectionKey } from '@/types/public-site'
import type { TemplateProps } from '@/types/template'

type BusinessWebsiteProps = TemplateProps & {
  typeLabelKey:
    | 'restaurantLabel'
    | 'cafeLabel'
    | 'barLabel'
    | 'loungeLabel'
    | 'salonLabel'
    | 'clinicLabel'
    | 'consultancyLabel'
    | 'hotelLabel'
    | 'architectLabel'
    | 'doctorLabel'
    | 'legalLabel'
  offeringsTitleKey: 'menuLabel' | 'servicesLabel' | 'expertiseLabel' | 'roomsLabel'
}

const DEFAULT_SECTION_ORDER: PublicSiteSectionKey[] = ['about', 'offerings', 'gallery', 'team', 'hours', 'contact']

const COLOR_PRESETS = {
  neutral: {
    brand: '#111827',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#18181b',
  },
  ocean: {
    brand: '#0f766e',
    background: '#f0fdfa',
    surface: '#ffffff',
    text: '#0f172a',
  },
  forest: {
    brand: '#166534',
    background: '#f0fdf4',
    surface: '#ffffff',
    text: '#14532d',
  },
  charcoal: {
    brand: '#334155',
    background: '#0f172a',
    surface: '#111827',
    text: '#e5e7eb',
  },
} as const

const DEFAULT_EDITOR_CONFIG = {
  theme_preset: 'classic' as const,
  color_preset: 'neutral' as const,
  hero_alignment: 'left' as const,
  button_style: 'rounded' as const,
  brand_color: null,
  background_color: null,
  surface_color: null,
  page_background_color: null,
  section_background_color: null,
  card_background_color: null,
  text_color: null,
  gallery_columns: 4 as const,
  section_order: DEFAULT_SECTION_ORDER,
  nav_cta_label: null,
  hero_title: null,
  about_title: null,
  about_body: null,
  offerings_title: null,
  gallery_title: null,
  team_title: null,
  hours_title: null,
  contact_title: null,
  contact_body: null,
  footer_note: null,
}

function getSectionOrder(value: PublicSiteSectionKey[] | undefined): PublicSiteSectionKey[] {
  if (!value || value.length !== DEFAULT_SECTION_ORDER.length) {
    return DEFAULT_SECTION_ORDER
  }

  const allowed = new Set(DEFAULT_SECTION_ORDER)
  const deduped = Array.from(new Set(value.filter((item) => allowed.has(item))))
  return deduped.length === DEFAULT_SECTION_ORDER.length ? deduped : DEFAULT_SECTION_ORDER
}

function formatPrice(value?: number | null) {
  if (typeof value !== 'number') {
    return null
  }

  return `${value.toFixed(2)}`
}

function hexToRgb(hex: string) {
  const safe = hex.replace('#', '')
  const parsed = Number.parseInt(safe, 16)

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  }
}

function withAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex)
  const safeAlpha = Math.min(Math.max(alpha, 0), 1)
  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`
}

export default async function BusinessWebsite({
  business,
  services = [],
  staff = [],
  publicConfig,
  publicAssets = [],
  typeLabelKey,
  offeringsTitleKey,
}: BusinessWebsiteProps) {
  const t = await getTranslations('public')
  const locale = (await getLocale()) as 'en' | 'fr' | 'ar'
  const mapsQuery = encodeURIComponent(business.address || business.name)
  const hasCover = Boolean(business.cover_image_url)
  const uploadedGalleryImages = publicAssets.filter((asset) => asset.type === 'gallery').map((asset) => asset.file_url)
  const uploadedMenuAssets = publicAssets.filter((asset) => asset.type === 'menu')
  const galleryImages = uploadedGalleryImages.length
    ? uploadedGalleryImages
    : ([business.cover_image_url, business.logo_url, business.cover_image_url, business.logo_url].filter(Boolean) as string[])
  const config = publicConfig ?? {
    show_gallery: true,
    show_team: true,
    show_map: true,
    show_hours: true,
    show_contact: true,
    show_offerings: true,
    tagline: null,
    hero_cta_label: null,
    secondary_cta_label: null,
    editor: DEFAULT_EDITOR_CONFIG,
  }
  const editor = config.editor ?? DEFAULT_EDITOR_CONFIG
  const isAppointmentBusiness = usesAppointmentTerminology(business.type)
  const secondaryCta = config.secondary_cta_label?.trim() || editor.offerings_title?.trim() || t(offeringsTitleKey)
  const heroTagline = config.tagline?.trim() || business.description || t('aboutFallback')
  const heroTitle = editor.hero_title?.trim() || business.name
  const defaultCtaLabel = t(isAppointmentBusiness ? 'bookAppointmentCta' : 'reserveCta')
  const primaryCta = config.hero_cta_label?.trim() || defaultCtaLabel
  const navCtaLabel = editor.nav_cta_label?.trim() || defaultCtaLabel
  const aboutTitle = editor.about_title?.trim() || t('aboutLabel')
  const aboutBody = editor.about_body?.trim() || business.description || t('aboutFallback')
  const offeringsTitleText = editor.offerings_title?.trim() || t(offeringsTitleKey)
  const galleryTitle = editor.gallery_title?.trim() || t('galleryLabel')
  const teamTitle = editor.team_title?.trim() || t('teamLabel')
  const hoursTitle = editor.hours_title?.trim() || t('hoursLabel')
  const contactTitle = editor.contact_title?.trim() || t('contactLabel')
  const contactBody = editor.contact_body?.trim()
  const footerNote = editor.footer_note?.trim()
  const sectionOrder = getSectionOrder(editor.section_order)

  const isSoftTheme = editor.theme_preset === 'soft'
  const isBoldTheme = editor.theme_preset === 'bold'
  const isCenteredHero = editor.hero_alignment === 'center'
  const preset = COLOR_PRESETS[editor.color_preset ?? 'neutral']
  const resolvedBrand = editor.brand_color || business.primary_color || preset.brand
  const resolvedBackground = editor.background_color || editor.page_background_color || preset.background
  const resolvedSurface =
    editor.surface_color || editor.section_background_color || editor.card_background_color || preset.surface
  const resolvedText = editor.text_color || preset.text
  const borderColor = withAlpha(resolvedText, isBoldTheme ? 0.3 : 0.16)
  const mutedTextColor = withAlpha(resolvedText, 0.72)
  const softTextColor = withAlpha(resolvedText, 0.58)
  const navBackgroundColor = withAlpha(resolvedSurface, 0.92)
  const footerBackgroundColor = resolvedSurface
  const buttonRadius = editor.button_style === 'pill' ? 'rounded-full' : 'rounded-md'
  const galleryGridClass =
    editor.gallery_columns === 2
      ? 'mt-8 grid gap-4 sm:grid-cols-2'
      : editor.gallery_columns === 3
        ? 'mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
        : 'mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'

  const sectionShellClass = 'border-b py-16 sm:py-20'
  const cardClass = isBoldTheme
    ? 'rounded-xl border p-5 shadow'
    : 'rounded-xl border p-5 shadow-sm'
  const heroOverlayClass = hasCover
    ? isBoldTheme
      ? 'bg-black/60'
      : 'bg-black/50'
    : ''

  const pageStyle = { backgroundColor: resolvedBackground, color: resolvedText }
  const sectionStyle = { borderColor, backgroundColor: resolvedSurface }
  const cardStyle = { borderColor, backgroundColor: resolvedSurface, color: resolvedText }
  const panelStyle = { borderColor, backgroundColor: withAlpha(resolvedSurface, 0.85) }
  const subtlePanelStyle = { borderColor, backgroundColor: withAlpha(resolvedSurface, 0.7) }
  const heroFallbackStyle = {
    backgroundImage: `linear-gradient(135deg, ${withAlpha(resolvedBrand, 0.96)}, ${withAlpha(resolvedText, 0.92)})`,
  }

  const navLinks = [
    { key: 'about' as const, visible: true, href: '#about', label: aboutTitle },
    { key: 'offerings' as const, visible: config.show_offerings, href: '#offerings', label: offeringsTitleText },
    { key: 'gallery' as const, visible: config.show_gallery, href: '#gallery', label: galleryTitle },
    { key: 'team' as const, visible: config.show_team && staff.length > 0, href: '#team', label: teamTitle },
    { key: 'hours' as const, visible: config.show_hours, href: '#hours', label: hoursTitle },
    { key: 'contact' as const, visible: config.show_contact, href: '#contact', label: contactTitle },
  ].filter((item) => item.visible)

  const sections: Record<PublicSiteSectionKey, JSX.Element | null> = {
    about: (
      <section id="about" className={sectionShellClass} style={sectionStyle}>
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{aboutTitle}</h2>
          <p className="mt-4 max-w-3xl" style={{ color: mutedTextColor }}>{aboutBody}</p>
        </div>
      </section>
    ),
    offerings: config.show_offerings ? (
      <section id="offerings" className={sectionShellClass} style={sectionStyle}>
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{offeringsTitleText}</h2>
            <Link
              href={`/${business.slug}/reserve`}
              className="rounded-md border px-4 py-2 text-sm font-semibold"
              style={{ borderColor, color: resolvedText }}
            >
              {defaultCtaLabel}
            </Link>
          </div>

          {services.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-sm" style={{ borderColor, color: softTextColor }}>
              {t('aboutFallback')}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article key={service.id} className={cardClass} style={cardStyle}>
                  <h3 className="text-base font-semibold">{service.name}</h3>
                  <p className="mt-2 text-sm" style={{ color: mutedTextColor }}>{service.description || t('aboutFallback')}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-mono" style={{ color: softTextColor }}>{service.duration_minutes} min</span>
                    <span className="font-semibold">{formatPrice(service.price) ? `${formatPrice(service.price)}` : '—'}</span>
                  </div>
                </article>
              ))}
            </div>
          )}

          {uploadedMenuAssets.length > 0 ? (
            <div className="mt-8 rounded-xl border p-5" style={panelStyle}>
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: mutedTextColor }}>{t('menuFilesLabel')}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {uploadedMenuAssets.map((asset, index) => (
                  <a
                    key={asset.id}
                    href={asset.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border px-3 py-2 text-sm"
                    style={{ borderColor, color: resolvedText, backgroundColor: resolvedBackground }}
                  >
                    {asset.title?.trim() || `${t('menuFileItem')} ${index + 1}`}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    ) : null,
    gallery: config.show_gallery ? (
      <section id="gallery" className={sectionShellClass} style={sectionStyle}>
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{galleryTitle}</h2>
          {galleryImages.length > 0 ? (
            <div className={galleryGridClass}>
              {galleryImages.slice(0, 8).map((image, index) => (
                <div key={`${image}-${index}`} className="overflow-hidden rounded-xl border" style={subtlePanelStyle}>
                  <img src={image} alt={`${business.name} ${index + 1}`} className="h-48 w-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed p-8 text-sm" style={{ borderColor, color: softTextColor }}>
              {t('galleryUploadHint')}
            </div>
          )}
        </div>
      </section>
    ) : null,
    team: config.show_team && staff.length > 0 ? (
      <section id="team" className={sectionShellClass} style={sectionStyle}>
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{teamTitle}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((member) => (
              <article key={member.id} className={cardClass} style={cardStyle}>
                <p className="text-base font-semibold">{member.name}</p>
                <p className="mt-1 text-sm" style={{ color: mutedTextColor }}>{member.role || t('teamMemberFallback')}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    ) : null,
    hours: config.show_hours ? (
      <section id="hours" className={sectionShellClass} style={sectionStyle}>
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{hoursTitle}</h2>
          <div className="mt-8 rounded-xl border" style={panelStyle}>
            <div className="grid grid-cols-2 border-b px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ borderColor, color: softTextColor }}>
              <span>{t('openLabel')}</span>
              <span>{t('closeLabel')}</span>
            </div>
            <div className="grid grid-cols-2 px-5 py-4 text-sm" style={{ color: mutedTextColor }}>
              <span className="font-mono">{business.opening_time}</span>
              <span className="font-mono">{business.closing_time}</span>
            </div>
          </div>
        </div>
      </section>
    ) : null,
    contact: config.show_contact ? (
      <section id="contact" className="py-16 sm:py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2" style={{ backgroundColor: resolvedSurface }}>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{contactTitle}</h2>
            {contactBody ? <p className="mt-4 max-w-xl" style={{ color: mutedTextColor }}>{contactBody}</p> : null}
            <div className="mt-6 space-y-2" style={{ color: mutedTextColor }}>
              <p>{business.address || t('addressFallback')}</p>
              <p>{business.phone || t('phoneFallback')}</p>
              <p>{business.email || t('emailFallback')}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <Link
                href={`/${business.slug}/reserve`}
                className={`${buttonRadius} px-5 py-2.5 text-sm font-semibold text-white`}
                style={{ backgroundColor: resolvedBrand }}
              >
                {primaryCta}
              </Link>
            </div>
          </div>

          {config.show_map ? (
            <div className="overflow-hidden rounded-xl border" style={panelStyle}>
              <iframe
                title="Google Maps"
                src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
                className="h-[320px] w-full"
                loading="lazy"
              />
            </div>
          ) : null}
        </div>
      </section>
    ) : null,
  }

  const orderedSections = sectionOrder.map((key) => sections[key]).filter(Boolean)

  return (
    <main className={`min-h-screen ${isSoftTheme ? 'bg-zinc-50' : 'bg-white'} text-zinc-900`} style={pageStyle}>
      <BusinessWebsiteTopNav
        businessName={business.name}
        businessLogoUrl={business.logo_url}
        reserveHref={`/${business.slug}/reserve`}
        navCtaLabel={navCtaLabel}
        buttonRadiusClass={buttonRadius}
        accentColor={resolvedBrand}
        navBackgroundColor={navBackgroundColor}
        borderColor={borderColor}
        textColor={resolvedText}
        mutedTextColor={mutedTextColor}
        surfaceColor={resolvedSurface}
        locale={locale}
        links={navLinks}
      />

      <section
        id="top"
        className="relative min-h-[calc(100svh-4rem)] overflow-hidden"
        style={
          hasCover
            ? {
                backgroundImage: `url(${business.cover_image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : heroFallbackStyle
        }
      >
        <div className={`${heroOverlayClass} flex min-h-[calc(100svh-4rem)] items-center px-4 py-16 text-white sm:px-6`}>
          <div className={`mx-auto w-full max-w-6xl ${isCenteredHero ? 'text-center' : ''}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">{t(typeLabelKey)}</p>
            <h1 className={`mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl ${isCenteredHero ? 'mx-auto max-w-4xl' : 'max-w-3xl'}`}>
              {heroTitle}
            </h1>
            <p className={`mt-6 text-base text-white/85 sm:text-lg ${isCenteredHero ? 'mx-auto max-w-3xl' : 'max-w-2xl'}`}>
              {heroTagline}
            </p>
            <div className={`mt-8 flex flex-wrap gap-3 ${isCenteredHero ? 'justify-center' : ''}`}>
              <Link
                href={`/${business.slug}/reserve`}
                className={`${buttonRadius} px-6 py-3 text-sm font-semibold text-white`}
                style={{ backgroundColor: resolvedBrand }}
              >
                {primaryCta}
              </Link>
              {config.show_offerings ? (
                <a href="#offerings" className={`${buttonRadius} border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm`}>
                  {secondaryCta}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {orderedSections}

      <footer className="border-t" style={{ borderColor, backgroundColor: footerBackgroundColor }}>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6" style={{ color: mutedTextColor }}>
          <p>{footerNote || `© 2026 ${business.name}. All rights reserved.`}</p>
          <div className="flex flex-wrap items-center gap-4">
            {navLinks.map((link) => (
              <a key={`footer-${link.key}`} href={link.href} className="transition" style={{ color: mutedTextColor }}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  )
}