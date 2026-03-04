import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import BusinessLocaleSwitcher from '@/components/templates/shared/BusinessLocaleSwitcher'
import type { TemplateProps } from '@/types/template'

type BusinessWebsiteProps = TemplateProps & {
  typeLabelKey: 'restaurantLabel' | 'salonLabel' | 'clinicLabel' | 'consultancyLabel' | 'hotelLabel'
  offeringsTitle: string
}

function formatPrice(value?: number | null) {
  if (typeof value !== 'number') {
    return null
  }

  return `${value.toFixed(2)}`
}

export default async function BusinessWebsite({
  business,
  services = [],
  staff = [],
  publicConfig,
  publicAssets = [],
  typeLabelKey,
  offeringsTitle,
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
  }
  const primaryCta = config.hero_cta_label?.trim() || t('reserveCta')
  const secondaryCta = config.secondary_cta_label?.trim() || offeringsTitle
  const heroTagline = config.tagline?.trim() || business.description || t('aboutFallback')

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <nav className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-3">
            {business.logo_url ? <img src={business.logo_url} alt={business.name} className="h-8 w-8 rounded object-cover" /> : null}
            <span className="text-sm font-semibold tracking-wide text-zinc-900">{business.name}</span>
          </a>

          <div className="hidden items-center gap-6 text-sm text-zinc-600 md:flex">
            <a href="#about" className="transition hover:text-zinc-900">{t('aboutLabel')}</a>
            {config.show_offerings ? <a href="#offerings" className="transition hover:text-zinc-900">{offeringsTitle}</a> : null}
            {config.show_hours ? <a href="#hours" className="transition hover:text-zinc-900">{t('hoursLabel')}</a> : null}
            {config.show_contact ? <a href="#contact" className="transition hover:text-zinc-900">{t('contactLabel')}</a> : null}
          </div>

          <div className="flex items-center gap-3">
            <BusinessLocaleSwitcher currentLocale={locale} accentColor={business.primary_color} />
            <Link
              href={`/${business.slug}/reserve`}
              className="rounded-md px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: business.primary_color || '#111827' }}
            >
              {t('reserveCta')}
            </Link>
          </div>
        </div>
      </nav>

      <section
        id="top"
        className="relative overflow-hidden border-b border-zinc-200"
        style={
          hasCover
            ? {
                backgroundImage: `url(${business.cover_image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        <div className={`${hasCover ? 'bg-black/50' : 'bg-gradient-to-br from-zinc-900 to-zinc-700'} px-4 py-24 text-white sm:px-6 lg:py-32`}>
          <div className="mx-auto w-full max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">{t(typeLabelKey)}</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {business.name}
            </h1>
            <p className="mt-6 max-w-2xl text-base text-white/85 sm:text-lg">
              {heroTagline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/${business.slug}/reserve`}
                className="rounded-md px-6 py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: business.primary_color || '#111827' }}
              >
                {primaryCta}
              </Link>
              {config.show_offerings ? (
                <a href="#offerings" className="rounded-md border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white">
                  {secondaryCta}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="border-b border-zinc-200 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('aboutLabel')}</h2>
          <p className="mt-4 max-w-3xl text-zinc-600">{business.description || t('aboutFallback')}</p>
        </div>
      </section>

      {config.show_offerings ? (
        <section id="offerings" className="border-b border-zinc-200 py-16 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{offeringsTitle}</h2>
              <Link
                href={`/${business.slug}/reserve`}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                {t('reserveCta')}
              </Link>
            </div>

            {services.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-sm text-zinc-500">{t('aboutFallback')}</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <article key={service.id} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-semibold text-zinc-900">{service.name}</h3>
                    <p className="mt-2 text-sm text-zinc-600">{service.description || t('aboutFallback')}</p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="font-mono text-zinc-500">{service.duration_minutes} min</span>
                      <span className="font-semibold text-zinc-900">{formatPrice(service.price) ? `${formatPrice(service.price)}` : '—'}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {uploadedMenuAssets.length > 0 ? (
              <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Menu Files</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {uploadedMenuAssets.map((asset, index) => (
                    <a
                      key={asset.id}
                      href={asset.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                    >
                      {asset.title?.trim() || `Menu ${index + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {config.show_gallery ? (
        <section className="border-b border-zinc-200 py-16 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Gallery</h2>
            {galleryImages.length > 0 ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {galleryImages.slice(0, 4).map((image, index) => (
                  <div key={`${image}-${index}`} className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                    <img src={image} alt={`${business.name} ${index + 1}`} className="h-48 w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-dashed border-zinc-300 p-8 text-sm text-zinc-500">
                Upload gallery images from Dashboard → Website to populate your gallery.
              </div>
            )}
          </div>
        </section>
      ) : null}

      {config.show_team && staff.length > 0 ? (
        <section className="border-b border-zinc-200 py-16 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('teamLabel')}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {staff.map((member) => (
                <article key={member.id} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <p className="text-base font-semibold text-zinc-900">{member.name}</p>
                  <p className="mt-1 text-sm text-zinc-600">{member.role || 'Team member'}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {config.show_hours ? (
        <section id="hours" className="border-b border-zinc-200 py-16 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('hoursLabel')}</h2>
            <div className="mt-8 rounded-xl border border-zinc-200">
              <div className="grid grid-cols-2 border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <span>{t('openLabel')}</span>
                <span>{t('closeLabel')}</span>
              </div>
              <div className="grid grid-cols-2 px-5 py-4 text-sm text-zinc-700">
                <span className="font-mono">{business.opening_time}</span>
                <span className="font-mono">{business.closing_time}</span>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {config.show_contact ? (
        <section id="contact" className="py-16 sm:py-20">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('contactLabel')}</h2>
              <div className="mt-6 space-y-2 text-zinc-600">
                <p>{business.address || t('addressFallback')}</p>
                <p>{business.phone || t('phoneFallback')}</p>
                <p>{business.email || t('emailFallback')}</p>
              </div>
              <div className="mt-6 flex gap-3">
                <Link
                  href={`/${business.slug}/reserve`}
                  className="rounded-md px-5 py-2.5 text-sm font-semibold text-white"
                  style={{ backgroundColor: business.primary_color || '#111827' }}
                >
                  {t('reserveCta')}
                </Link>
              </div>
            </div>

            {config.show_map ? (
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
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
      ) : null}

      <footer className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 {business.name}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#about" className="hover:text-zinc-900">{t('aboutLabel')}</a>
            {config.show_offerings ? <a href="#offerings" className="hover:text-zinc-900">{offeringsTitle}</a> : null}
            {config.show_contact ? <a href="#contact" className="hover:text-zinc-900">{t('contactLabel')}</a> : null}
          </div>
        </div>
      </footer>
    </main>
  )
}