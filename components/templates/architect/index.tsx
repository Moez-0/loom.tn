import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import BusinessWebsiteTopNav from '@/components/templates/shared/BusinessWebsiteTopNav'
import ArchitectParallaxLayer from '@/components/templates/architect/ArchitectParallaxLayer'
import ArchitectMotionDecor from '@/components/templates/architect/ArchitectMotionDecor'
import { usesAppointmentTerminology } from '@/lib/business-type-config'
import type { PublicSiteSectionKey } from '@/types/public-site'
import type { TemplateProps } from '@/types/template'

const DEFAULT_SECTION_ORDER: PublicSiteSectionKey[] = ['about', 'offerings', 'gallery', 'team', 'hours', 'contact']

const DEFAULT_EDITOR_CONFIG = {
  theme_preset: 'classic' as const,
  color_preset: 'charcoal' as const,
  hero_alignment: 'left' as const,
  button_style: 'rounded' as const,
  brand_color: null,
  background_color: null,
  surface_color: null,
  page_background_color: null,
  section_background_color: null,
  card_background_color: null,
  text_color: null,
  gallery_columns: 3 as const,
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
  architect_show_grid_lines: true,
  architect_show_shapes: true,
  architect_motion_intensity: 'medium' as const,
  architect_contact_layout: 'split' as const,
  architect_contact_highlight: null,
  architect_projects_label: null,
  architect_projects_value: null,
  architect_years_label: null,
  architect_years_value: null,
  architect_disciplines_label: null,
  architect_disciplines_value: null,
  architect_process_title: null,
  architect_process_step1_title: null,
  architect_process_step1_description: null,
  architect_process_step2_title: null,
  architect_process_step2_description: null,
  architect_process_step3_title: null,
  architect_process_step3_description: null,
  footer_note: null,
}

function getSectionOrder(value: PublicSiteSectionKey[] | undefined) {
  if (!value || value.length !== DEFAULT_SECTION_ORDER.length) {
    return DEFAULT_SECTION_ORDER
  }

  const allowed = new Set(DEFAULT_SECTION_ORDER)
  const deduped = Array.from(new Set(value.filter((item) => allowed.has(item))))
  return deduped.length === DEFAULT_SECTION_ORDER.length ? deduped : DEFAULT_SECTION_ORDER
}

function hexToRgb(hex: string) {
  const safe = hex.replace('#', '')
  const parsed = Number.parseInt(safe, 16)

  return {
    red: (parsed >> 16) & 255,
    green: (parsed >> 8) & 255,
    blue: parsed & 255,
  }
}

function withAlpha(hex: string, alpha: number) {
  const { red, green, blue } = hexToRgb(hex)
  const safeAlpha = Math.min(Math.max(alpha, 0), 1)
  return `rgba(${red}, ${green}, ${blue}, ${safeAlpha})`
}

function formatPrice(value?: number | null) {
  if (typeof value !== 'number') {
    return null
  }

  return `${value.toFixed(2)}`
}

export default async function ArchitectTemplate({ business, services = [], staff = [], publicConfig, publicAssets = [] }: TemplateProps) {
  const t = await getTranslations('public')
  const locale = (await getLocale()) as 'en' | 'fr' | 'ar'
  const mapsQuery = encodeURIComponent(business.address || business.name)
  const isAppointmentBusiness = usesAppointmentTerminology(business.type)

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
  const sectionOrder = getSectionOrder(editor.section_order)
  const buttonRadius = editor.button_style === 'pill' ? 'rounded-full' : 'rounded-md'

  const brandColor = editor.brand_color || business.primary_color || '#27272a'
  const backgroundColor = editor.background_color || editor.page_background_color || '#09090b'
  const surfaceColor = editor.surface_color || editor.section_background_color || editor.card_background_color || '#18181b'
  const textColor = editor.text_color || '#fafafa'

  const borderColor = withAlpha(textColor, 0.16)
  const mutedTextColor = withAlpha(textColor, 0.72)
  const softTextColor = withAlpha(textColor, 0.56)
  const lineColor = withAlpha(textColor, 0.26)
  const shapeColor = withAlpha(textColor, 0.3)
  const heroTitle = editor.hero_title?.trim() || business.name
  const heroTagline = config.tagline?.trim() || business.description || t('aboutFallback')
  const defaultCtaLabel = t(isAppointmentBusiness ? 'bookAppointmentCta' : 'reserveCta')
  const primaryCtaLabel = config.hero_cta_label?.trim() || defaultCtaLabel
  const secondaryCtaLabel = config.secondary_cta_label?.trim() || t('expertiseLabel')
  const navCtaLabel = editor.nav_cta_label?.trim() || defaultCtaLabel

  const aboutTitle = editor.about_title?.trim() || t('aboutLabel')
  const aboutBody = editor.about_body?.trim() || business.description || t('aboutFallback')
  const offeringsTitle = editor.offerings_title?.trim() || t('expertiseLabel')
  const galleryTitle = editor.gallery_title?.trim() || t('galleryLabel')
  const teamTitle = editor.team_title?.trim() || t('teamLabel')
  const hoursTitle = editor.hours_title?.trim() || t('hoursLabel')
  const contactTitle = editor.contact_title?.trim() || t('contactLabel')
  const contactBody = editor.contact_body?.trim()
  const showGridLines = editor.architect_show_grid_lines
  const showShapes = editor.architect_show_shapes
  const motionIntensity = editor.architect_motion_intensity
  const contactLayout = editor.architect_contact_layout
  const contactHighlight = editor.architect_contact_highlight?.trim() || null
  const projectsLabel = editor.architect_projects_label?.trim() || t('architectProjectsLabel')
  const yearsLabel = editor.architect_years_label?.trim() || t('architectYearsLabel')
  const disciplinesLabel = editor.architect_disciplines_label?.trim() || t('architectDisciplinesLabel')
  const processTitle = editor.architect_process_title?.trim() || t('architectProcessDefaultTitle')
  const footerNote = editor.footer_note?.trim()

  const uploadedGalleryImages = publicAssets
    .filter((asset) => asset.type === 'gallery')
    .sort((firstAsset, secondAsset) => firstAsset.sort_order - secondAsset.sort_order)
    .map((asset) => asset.file_url)

  const fallbackImages = [business.cover_image_url, business.logo_url, business.cover_image_url, business.logo_url].filter(Boolean) as string[]
  const galleryImages = uploadedGalleryImages.length > 0 ? uploadedGalleryImages : fallbackImages

  const navLinks = [
    { key: 'about', visible: true, href: '#about', label: aboutTitle },
    { key: 'offerings', visible: config.show_offerings, href: '#offerings', label: offeringsTitle },
    { key: 'gallery', visible: config.show_gallery, href: '#gallery', label: galleryTitle },
    { key: 'team', visible: config.show_team && staff.length > 0, href: '#team', label: teamTitle },
    { key: 'hours', visible: config.show_hours, href: '#hours', label: hoursTitle },
    { key: 'contact', visible: config.show_contact, href: '#contact', label: contactTitle },
  ].filter((item) => item.visible)

  const fallbackProjects = Math.max(galleryImages.length * 4, 12)
  const fallbackYears = Math.max(staff.length * 2, 6)
  const fallbackDisciplines = Math.max(services.length, 3)

  const statProjects = editor.architect_projects_value?.trim() || String(fallbackProjects)
  const statYears = editor.architect_years_value?.trim() || String(fallbackYears)
  const statDisciplines = editor.architect_disciplines_value?.trim() || String(fallbackDisciplines)

  const processCards = [
    {
      step: '01',
      title: editor.architect_process_step1_title?.trim() || services[0]?.name || t('architectProcessStep1Title'),
      description:
        editor.architect_process_step1_description?.trim()
        || services[0]?.description
        || t('architectProcessStep1Description'),
    },
    {
      step: '02',
      title: editor.architect_process_step2_title?.trim() || services[1]?.name || t('architectProcessStep2Title'),
      description:
        editor.architect_process_step2_description?.trim()
        || services[1]?.description
        || t('architectProcessStep2Description'),
    },
    {
      step: '03',
      title: editor.architect_process_step3_title?.trim() || services[2]?.name || t('architectProcessStep3Title'),
      description:
        editor.architect_process_step3_description?.trim()
        || services[2]?.description
        || t('architectProcessStep3Description'),
    },
  ]

  const sectionShellClass = 'relative overflow-hidden border-b py-20 sm:py-24'
  const cardClass = 'rounded-2xl border p-6 backdrop-blur-sm'
  const pageStyle = { backgroundColor, color: textColor }
  const sectionStyle = { borderColor, backgroundColor: withAlpha(surfaceColor, 0.82) }
  const cardStyle = { borderColor, backgroundColor: withAlpha(surfaceColor, 0.76) }
  const panelStyle = { borderColor, backgroundColor: withAlpha(backgroundColor, 0.48) }

  const sections: Record<PublicSiteSectionKey, JSX.Element | null> = {
    about: (
      <section id="about" className={sectionShellClass} style={sectionStyle}>
        <ArchitectParallaxLayer
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/30"
          speed={0.06}
          opacity={0.4}
          intensity={motionIntensity}
        />
        <ArchitectMotionDecor
          showGridLines={showGridLines}
          showShapes={showShapes}
          intensity={motionIntensity}
          lineColor={lineColor}
          shapeColor={shapeColor}
        />
        <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: softTextColor }}>{t('architectLabel')}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{aboutTitle}</h2>
            <p className="mt-6 max-w-2xl leading-relaxed" style={{ color: mutedTextColor }}>{aboutBody}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <article className={cardClass} style={cardStyle}>
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: softTextColor }}>{projectsLabel}</p>
              <p className="mt-3 text-4xl font-semibold">{statProjects}</p>
            </article>
            <article className={cardClass} style={cardStyle}>
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: softTextColor }}>{yearsLabel}</p>
              <p className="mt-3 text-4xl font-semibold">{statYears}</p>
            </article>
            <article className={cardClass} style={cardStyle}>
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: softTextColor }}>{disciplinesLabel}</p>
              <p className="mt-3 text-4xl font-semibold">{statDisciplines}</p>
            </article>
          </div>
        </div>
      </section>
    ),
    offerings: config.show_offerings ? (
      <section id="offerings" className={sectionShellClass} style={sectionStyle}>
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: softTextColor }}>{t('expertiseLabel')}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{offeringsTitle}</h2>
            </div>
            <Link
              href={`/${business.slug}/reserve`}
              className={`${buttonRadius} px-5 py-2.5 text-sm font-semibold text-white`}
              style={{ backgroundColor: brandColor }}
            >
              {primaryCtaLabel}
            </Link>
          </div>

          {services.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-sm" style={{ borderColor, color: softTextColor }}>
              {t('aboutFallback')}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service, index) => (
                <article key={service.id} className={cardClass} style={cardStyle}>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: softTextColor }}>
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-4 text-lg font-semibold">{service.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: mutedTextColor }}>
                    {service.description || t('aboutFallback')}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm" style={{ borderColor }}>
                    <span className="font-mono" style={{ color: softTextColor }}>{service.duration_minutes} min</span>
                    <span className="font-semibold">{formatPrice(service.price) ? `${formatPrice(service.price)} DT` : '—'}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    ) : null,
    gallery: config.show_gallery ? (
      <section id="gallery" className={sectionShellClass} style={sectionStyle}>
        <ArchitectParallaxLayer
          className="pointer-events-none absolute inset-x-0 top-10 h-40 bg-white/10 blur-3xl"
          speed={0.18}
          opacity={0.55}
          intensity={motionIntensity}
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: softTextColor }}>Portfolio</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{galleryTitle}</h2>

          {galleryImages.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {galleryImages.slice(0, 9).map((image, index) => (
                <article key={`${image}-${index}`} className="group overflow-hidden rounded-2xl border" style={panelStyle}>
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={image}
                      alt={`${business.name} project ${index + 1}`}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/70">Project {String(index + 1).padStart(2, '0')}</p>
                      <p className="mt-2 text-base font-semibold text-white">{business.name}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed p-8 text-sm" style={{ borderColor, color: softTextColor }}>
              {t('galleryUploadHint')}
            </div>
          )}
        </div>
      </section>
    ) : null,
    team: config.show_team && staff.length > 0 ? (
      <section id="team" className={sectionShellClass} style={sectionStyle}>
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{teamTitle}</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((member) => (
              <article key={member.id} className={cardClass} style={cardStyle}>
                <p className="text-lg font-semibold">{member.name}</p>
                <p className="mt-2 text-sm" style={{ color: mutedTextColor }}>
                  {member.role || t('teamMemberFallback')}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    ) : null,
    hours: config.show_hours ? (
      <section id="hours" className={sectionShellClass} style={sectionStyle}>
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{hoursTitle}</h2>
          <div className="mt-8 rounded-2xl border" style={panelStyle}>
            <div className="grid grid-cols-2 border-b px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{ borderColor, color: softTextColor }}>
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
      <section id="contact" className="relative overflow-hidden py-20 sm:py-24">
        <ArchitectParallaxLayer
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
          speed={0.11}
          opacity={0.4}
          intensity={motionIntensity}
        />
        <ArchitectMotionDecor
          showGridLines={showGridLines}
          showShapes={showShapes}
          intensity={motionIntensity}
          lineColor={lineColor}
          shapeColor={shapeColor}
        />
        <div
          className={`relative mx-auto grid w-full max-w-6xl gap-8 px-4 sm:px-6 ${contactLayout === 'stacked' ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}
        >
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{contactTitle}</h2>
            {contactBody ? <p className="mt-4 max-w-xl leading-relaxed" style={{ color: mutedTextColor }}>{contactBody}</p> : null}

            {contactHighlight ? (
              <div className="mt-5 rounded-xl border px-4 py-3 text-sm" style={{ borderColor, backgroundColor: withAlpha(surfaceColor, 0.78) }}>
                {contactHighlight}
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2" style={{ color: mutedTextColor }}>
              <div className="rounded-xl border p-4" style={{ borderColor, backgroundColor: withAlpha(surfaceColor, 0.72) }}>
                <p className="text-xs uppercase tracking-[0.18em]" style={{ color: softTextColor }}>{t('addressLabel')}</p>
                <p className="mt-2 text-sm">{business.address || t('addressFallback')}</p>
              </div>
              <div className="rounded-xl border p-4" style={{ borderColor, backgroundColor: withAlpha(surfaceColor, 0.72) }}>
                <p className="text-xs uppercase tracking-[0.18em]" style={{ color: softTextColor }}>{t('phoneLabel')}</p>
                <p className="mt-2 text-sm">{business.phone || t('phoneFallback')}</p>
              </div>
              <div className="rounded-xl border p-4 sm:col-span-2" style={{ borderColor, backgroundColor: withAlpha(surfaceColor, 0.72) }}>
                <p className="text-xs uppercase tracking-[0.18em]" style={{ color: softTextColor }}>{t('emailLabel')}</p>
                <p className="mt-2 text-sm">{business.email || t('emailFallback')}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/${business.slug}/reserve`}
                className={`${buttonRadius} px-6 py-3 text-sm font-semibold text-white`}
                style={{ backgroundColor: brandColor }}
              >
                {primaryCtaLabel}
              </Link>
              <a href="#offerings" className={`${buttonRadius} border px-6 py-3 text-sm font-semibold`} style={{ borderColor, color: textColor }}>
                {secondaryCtaLabel}
              </a>
            </div>
          </div>

          {config.show_map ? (
            <div className="overflow-hidden rounded-2xl border" style={panelStyle}>
              <iframe
                title="Google Maps"
                src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
                className="h-[360px] w-full"
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
    <main className="min-h-screen overflow-x-clip" style={pageStyle}>
      <BusinessWebsiteTopNav
        businessName={business.name}
        businessLogoUrl={business.logo_url}
        reserveHref={`/${business.slug}/reserve`}
        navCtaLabel={navCtaLabel}
        buttonRadiusClass={buttonRadius}
        accentColor={brandColor}
        navBackgroundColor={withAlpha(backgroundColor, 0.86)}
        borderColor={borderColor}
        textColor={textColor}
        mutedTextColor={mutedTextColor}
        surfaceColor={surfaceColor}
        locale={locale}
        links={navLinks}
      />

      <section
        id="top"
        className="relative min-h-[calc(100svh-4rem)] overflow-hidden border-b"
        style={{ borderColor }}
      >
        <div
          className="absolute inset-0"
          style={
            business.cover_image_url
              ? {
                  backgroundImage: `url(${business.cover_image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {
                  backgroundImage: `linear-gradient(135deg, ${withAlpha(brandColor, 0.84)}, ${withAlpha(backgroundColor, 0.95)})`,
                }
          }
        />

        <ArchitectParallaxLayer className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/85" speed={0.12} opacity={1} intensity={motionIntensity} />
        <ArchitectParallaxLayer className="absolute -left-20 top-20 h-80 w-80 rounded-full bg-white/15 blur-3xl" speed={0.2} opacity={0.45} intensity={motionIntensity} />
        <ArchitectParallaxLayer className="absolute -right-24 bottom-8 h-[22rem] w-[22rem] rounded-full bg-white/10 blur-3xl" speed={0.24} opacity={0.35} intensity={motionIntensity} />
        <ArchitectMotionDecor
          showGridLines={showGridLines}
          showShapes={showShapes}
          intensity={motionIntensity}
          lineColor={withAlpha('#ffffff', 0.32)}
          shapeColor={withAlpha('#ffffff', 0.24)}
        />

        <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-6xl flex-col justify-end px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">{t('architectLabel')}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/82 sm:text-lg">{heroTagline}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${business.slug}/reserve`}
              className={`${buttonRadius} px-6 py-3 text-sm font-semibold text-white`}
              style={{ backgroundColor: brandColor }}
            >
              {primaryCtaLabel}
            </Link>
            <a href="#offerings" className={`${buttonRadius} border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm`}>
              {secondaryCtaLabel}
            </a>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b py-20 sm:py-24" style={{ borderColor, backgroundColor: withAlpha(surfaceColor, 0.72) }}>
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: softTextColor }}>{t('processLabel')}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{processTitle}</h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {processCards.map((card) => (
              <article key={card.step} className={cardClass} style={cardStyle}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: softTextColor }}>{card.step}</p>
                <h3 className="mt-4 text-lg font-semibold">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: mutedTextColor }}>{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {orderedSections}

      <footer className="border-t" style={{ borderColor, backgroundColor: withAlpha(surfaceColor, 0.9) }}>
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