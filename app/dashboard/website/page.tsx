import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getDefaultPublicSiteConfig,
  getPublicSiteConfig,
  savePublicSiteConfig,
} from '@/lib/public-site'
import { offeringsLabelKeyForBusinessType } from '@/lib/business-type-config'
import type { BusinessType } from '@/types'
import type { PublicSiteSectionKey } from '@/types/public-site'
import WebsiteSectionOrderBuilder from '@/components/dashboard/WebsiteSectionOrderBuilder'
import WebsiteLivePreviewSync from '@/components/dashboard/WebsiteLivePreviewSync'

type WebsiteBusiness = {
  id: string
  slug: string
  type: BusinessType
  name: string
}

const SECTION_ORDER_PRESETS: Record<'default' | 'storytelling' | 'conversion', PublicSiteSectionKey[]> = {
  default: ['about', 'offerings', 'gallery', 'team', 'hours', 'contact'],
  storytelling: ['about', 'gallery', 'offerings', 'team', 'hours', 'contact'],
  conversion: ['offerings', 'about', 'team', 'gallery', 'hours', 'contact'],
}

const DEFAULT_SECTION_ORDER: PublicSiteSectionKey[] = SECTION_ORDER_PRESETS.default

function parseSectionOrder(value: FormDataEntryValue | null): PublicSiteSectionKey[] {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return DEFAULT_SECTION_ORDER
  }

  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) {
      return DEFAULT_SECTION_ORDER
    }

    const allowed = new Set<PublicSiteSectionKey>(DEFAULT_SECTION_ORDER)
    const unique = parsed.filter((item): item is PublicSiteSectionKey => typeof item === 'string' && allowed.has(item as PublicSiteSectionKey))
    const deduped = Array.from(new Set(unique))

    return deduped.length === DEFAULT_SECTION_ORDER.length ? deduped : DEFAULT_SECTION_ORDER
  } catch {
    return DEFAULT_SECTION_ORDER
  }
}

function parseHexColor(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()
  return /^#[0-9a-f]{6}$/.test(normalized) ? normalized : null
}

async function getBusinessContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/dashboard/website')
  }

  const profile = await ensureUserProfile(user)
  return profile?.business_id ?? null
}

function websiteRedirectToken() {
  return `${Date.now()}`
}

async function updateWebsiteConfig(formData: FormData) {
  'use server'

  const businessId = await getBusinessContext()
  if (!businessId) {
    return
  }

  const admin = createAdminClient()
  if (!admin) {
    return
  }

  const sectionOrder = parseSectionOrder(formData.get('section_order'))

  await savePublicSiteConfig(admin, businessId, {
    show_gallery: formData.get('show_gallery') === 'on',
    show_team: formData.get('show_team') === 'on',
    show_map: formData.get('show_map') === 'on',
    show_hours: formData.get('show_hours') === 'on',
    show_contact: formData.get('show_contact') === 'on',
    show_offerings: formData.get('show_offerings') === 'on',
    tagline: String(formData.get('tagline') ?? '').trim() || null,
    hero_cta_label: String(formData.get('hero_cta_label') ?? '').trim() || null,
    secondary_cta_label: String(formData.get('secondary_cta_label') ?? '').trim() || null,
    editor: {
      theme_preset: ((): 'classic' | 'soft' | 'bold' => {
        const raw = String(formData.get('theme_preset') ?? 'classic')
        return raw === 'soft' || raw === 'bold' ? raw : 'classic'
      })(),
      color_preset: ((): 'neutral' | 'ocean' | 'forest' | 'charcoal' => {
        const raw = String(formData.get('color_preset') ?? 'neutral')
        return raw === 'ocean' || raw === 'forest' || raw === 'charcoal' ? raw : 'neutral'
      })(),
      hero_alignment: String(formData.get('hero_alignment') ?? 'left') === 'center' ? 'center' : 'left',
      button_style: String(formData.get('button_style') ?? 'rounded') === 'pill' ? 'pill' : 'rounded',
      brand_color: parseHexColor(formData.get('brand_color')),
      background_color: parseHexColor(formData.get('background_color')),
      surface_color: parseHexColor(formData.get('surface_color')),
      page_background_color: parseHexColor(formData.get('page_background_color')),
      section_background_color: parseHexColor(formData.get('section_background_color')),
      card_background_color: parseHexColor(formData.get('card_background_color')),
      text_color: parseHexColor(formData.get('text_color')),
      gallery_columns: ((): 2 | 3 | 4 => {
        const raw = Number(formData.get('gallery_columns'))
        return raw === 2 || raw === 3 ? raw : 4
      })(),
      section_order: sectionOrder,
      nav_cta_label: String(formData.get('nav_cta_label') ?? '').trim() || null,
      hero_title: String(formData.get('hero_title') ?? '').trim() || null,
      about_title: String(formData.get('about_title') ?? '').trim() || null,
      about_body: String(formData.get('about_body') ?? '').trim() || null,
      offerings_title: String(formData.get('offerings_title') ?? '').trim() || null,
      gallery_title: String(formData.get('gallery_title') ?? '').trim() || null,
      team_title: String(formData.get('team_title') ?? '').trim() || null,
      hours_title: String(formData.get('hours_title') ?? '').trim() || null,
      contact_title: String(formData.get('contact_title') ?? '').trim() || null,
      contact_body: String(formData.get('contact_body') ?? '').trim() || null,
      footer_note: String(formData.get('footer_note') ?? '').trim() || null,
    },
  })

  revalidatePath('/dashboard/website')
  revalidatePath('/dashboard/settings')
  redirect(`/dashboard/website?preview=${websiteRedirectToken()}`)
}

export default async function DashboardWebsitePage({
  searchParams,
}: {
  searchParams?: { preview?: string }
}) {
  const t = await getTranslations('dashboard')
  const tPublic = await getTranslations('public')
  const tw = (key: string, values?: Record<string, string | number>) => t(`websiteEditor.${key}`, values)
  const businessId = await getBusinessContext()

  if (!businessId) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('website')}</h1>
        <p className="mt-4 border border-loom-border bg-loom-white p-4 text-sm text-loom-muted">{t('noBusiness')}</p>
      </main>
    )
  }

  const admin = createAdminClient()
  if (!admin) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('website')}</h1>
        <p className="mt-4 border border-loom-error bg-loom-white p-4 text-sm text-loom-error">{t('missingServiceRoleKey')}</p>
      </main>
    )
  }

  const [{ data: business }, config] = await Promise.all([
    admin.from('businesses').select('id, slug, type, name').eq('id', businessId).single<WebsiteBusiness>(),
    getPublicSiteConfig(admin, businessId),
  ])

  if (!business) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('website')}</h1>
        <p className="mt-4 border border-loom-border bg-loom-white p-4 text-sm text-loom-muted">{t('noBusiness')}</p>
      </main>
    )
  }

  const effective = config ?? getDefaultPublicSiteConfig()
  const offeringsLabel = tPublic(offeringsLabelKeyForBusinessType(business.type))
  const previewToken = searchParams?.preview || websiteRedirectToken()
  const sectionLabels: Record<PublicSiteSectionKey, string> = {
    about: tPublic('aboutLabel'),
    offerings: offeringsLabel,
    gallery: tPublic('galleryLabel'),
    team: tPublic('teamLabel'),
    hours: tPublic('hoursLabel'),
    contact: tPublic('contactLabel'),
  }
  const builderFormId = 'website-builder-form'
  const previewIframeId = 'website-preview-iframe'

  return (
    <main>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">{t('dashboard')}</p>
          <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('website')}</h1>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          <Link href={`/${business.slug}`} className="btn-primary inline-flex items-center">
            {t('openPublicSite')}
          </Link>
          <Link href="/dashboard/uploads" className="btn-secondary inline-flex items-center">
            {t('manageUploads')}
          </Link>
          <Link href="/dashboard/settings" className="btn-secondary inline-flex items-center">
            {t('editBrandContent')}
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <form id={builderFormId} action={updateWebsiteConfig} className="card space-y-5 p-5">
            <div>
              <p className="section-label">{tw('title')}</p>
              <p className="mt-1 text-sm text-loom-muted">{tw('subtitle')}</p>
            </div>

            <div className="rounded-md border border-loom-border bg-loom-surface p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-loom-muted">{tw('designPreset')}</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="theme_preset">{tw('themeStyle')}</label>
                  <select id="theme_preset" name="theme_preset" className="input" defaultValue={effective.editor.theme_preset}>
                    <option value="classic">{tw('themeClassic')}</option>
                    <option value="soft">{tw('themeSoft')}</option>
                    <option value="bold">{tw('themeBold')}</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="color_preset">{tw('colorPreset')}</label>
                  <select id="color_preset" name="color_preset" className="input" defaultValue={effective.editor.color_preset}>
                    <option value="neutral">{tw('presetNeutral')}</option>
                    <option value="ocean">{tw('presetOcean')}</option>
                    <option value="forest">{tw('presetForest')}</option>
                    <option value="charcoal">{tw('presetCharcoal')}</option>
                  </select>
                </div>
                <div>
                  <p className="label">{tw('sectionOrder')}</p>
                  <WebsiteSectionOrderBuilder
                    defaultOrder={effective.editor.section_order}
                    labels={sectionLabels}
                    inputName="section_order"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="hero_alignment">{tw('heroAlignment')}</label>
                  <select id="hero_alignment" name="hero_alignment" className="input" defaultValue={effective.editor.hero_alignment}>
                    <option value="left">{tw('leftAligned')}</option>
                    <option value="center">{tw('centered')}</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="button_style">{tw('buttonShape')}</label>
                  <select id="button_style" name="button_style" className="input" defaultValue={effective.editor.button_style}>
                    <option value="rounded">{tw('rounded')}</option>
                    <option value="pill">{tw('pill')}</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="brand_color">{tw('brandAccentColor')}</label>
                  <input
                    id="brand_color"
                    name="brand_color"
                    type="color"
                    className="input h-11"
                    defaultValue={effective.editor.brand_color ?? '#111827'}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="background_color">{tw('pageBackgroundColor')}</label>
                  <input
                    id="background_color"
                    name="background_color"
                    type="color"
                    className="input h-11"
                    defaultValue={effective.editor.background_color ?? '#ffffff'}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="surface_color">{tw('surfaceColor')}</label>
                  <input
                    id="surface_color"
                    name="surface_color"
                    type="color"
                    className="input h-11"
                    defaultValue={effective.editor.surface_color ?? '#f8fafc'}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="text_color">{tw('textColor')}</label>
                  <input
                    id="text_color"
                    name="text_color"
                    type="color"
                    className="input h-11"
                    defaultValue={effective.editor.text_color ?? '#18181b'}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-md border border-loom-border bg-loom-surface p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-loom-muted">{tw('layout')}</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="gallery_columns">{tw('galleryColumns')}</label>
                  <select id="gallery_columns" name="gallery_columns" className="input" defaultValue={String(effective.editor.gallery_columns)}>
                    <option value="2">{tw('columns2')}</option>
                    <option value="3">{tw('columns3')}</option>
                    <option value="4">{tw('columns4')}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-loom-border bg-loom-surface p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-loom-muted">{tw('sectionVisibility')}</p>
              <p className="mt-1 text-xs text-loom-muted">{tw('sectionVisibilityHelp')}</p>

              <div className="mt-3 space-y-2">
                <label className="flex items-center justify-between rounded-md border border-loom-border bg-loom-white px-3 py-2 text-sm">
                  <span>{offeringsLabel}</span>
                  <input type="checkbox" name="show_offerings" defaultChecked={effective.show_offerings} />
                </label>
                <label className="flex items-center justify-between rounded-md border border-loom-border bg-loom-white px-3 py-2 text-sm">
                  <span>{tw('gallery')}</span>
                  <input type="checkbox" name="show_gallery" defaultChecked={effective.show_gallery} />
                </label>
                <label className="flex items-center justify-between rounded-md border border-loom-border bg-loom-white px-3 py-2 text-sm">
                  <span>{tw('team')}</span>
                  <input type="checkbox" name="show_team" defaultChecked={effective.show_team} />
                </label>
                <label className="flex items-center justify-between rounded-md border border-loom-border bg-loom-white px-3 py-2 text-sm">
                  <span>{tw('hours')}</span>
                  <input type="checkbox" name="show_hours" defaultChecked={effective.show_hours} />
                </label>
                <label className="flex items-center justify-between rounded-md border border-loom-border bg-loom-white px-3 py-2 text-sm">
                  <span>{tw('contact')}</span>
                  <input type="checkbox" name="show_contact" defaultChecked={effective.show_contact} />
                </label>
                <label className="flex items-center justify-between rounded-md border border-loom-border bg-loom-white px-3 py-2 text-sm">
                  <span>{tw('map')}</span>
                  <input type="checkbox" name="show_map" defaultChecked={effective.show_map} />
                </label>
              </div>
            </div>

            <div className="rounded-md border border-loom-border bg-loom-surface p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-loom-muted">{tw('heroAndNavigation')}</p>

              <div className="mt-3 space-y-3">
                <div>
                  <label className="label" htmlFor="hero_title">{tw('heroHeadlineOptional')}</label>
                  <input id="hero_title" name="hero_title" className="input" defaultValue={effective.editor.hero_title ?? ''} />
                </div>

                <div>
                  <label className="label" htmlFor="tagline">{tw('heroSupportingTextOptional')}</label>
                  <textarea id="tagline" name="tagline" className="input min-h-[90px]" defaultValue={effective.tagline ?? ''} />
                </div>

                <div>
                  <label className="label" htmlFor="hero_cta_label">{tw('primaryCtaLabelOptional')}</label>
                  <input id="hero_cta_label" name="hero_cta_label" className="input" defaultValue={effective.hero_cta_label ?? ''} />
                </div>

                <div>
                  <label className="label" htmlFor="secondary_cta_label">{tw('secondaryCtaLabelOptional')}</label>
                  <input id="secondary_cta_label" name="secondary_cta_label" className="input" defaultValue={effective.secondary_cta_label ?? ''} />
                </div>

                <div>
                  <label className="label" htmlFor="nav_cta_label">{tw('topNavigationCtaOptional')}</label>
                  <input id="nav_cta_label" name="nav_cta_label" className="input" defaultValue={effective.editor.nav_cta_label ?? ''} />
                </div>
              </div>
            </div>

            <div className="rounded-md border border-loom-border bg-loom-surface p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-loom-muted">{tw('sectionContent')}</p>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="label" htmlFor="about_title">{tw('aboutTitleOptional')}</label>
                  <input id="about_title" name="about_title" className="input" defaultValue={effective.editor.about_title ?? ''} />
                </div>
                <div>
                  <label className="label" htmlFor="about_body">{tw('aboutTextOptional')}</label>
                  <textarea id="about_body" name="about_body" className="input min-h-[90px]" defaultValue={effective.editor.about_body ?? ''} />
                </div>
                <div>
                  <label className="label" htmlFor="offerings_title">{tw('offeringsSectionTitleOptional', { offeringsLabel })}</label>
                  <input id="offerings_title" name="offerings_title" className="input" defaultValue={effective.editor.offerings_title ?? ''} />
                </div>
                <div>
                  <label className="label" htmlFor="gallery_title">{tw('gallerySectionTitleOptional')}</label>
                  <input id="gallery_title" name="gallery_title" className="input" defaultValue={effective.editor.gallery_title ?? ''} />
                </div>
                <div>
                  <label className="label" htmlFor="team_title">{tw('teamSectionTitleOptional')}</label>
                  <input id="team_title" name="team_title" className="input" defaultValue={effective.editor.team_title ?? ''} />
                </div>
                <div>
                  <label className="label" htmlFor="hours_title">{tw('hoursSectionTitleOptional')}</label>
                  <input id="hours_title" name="hours_title" className="input" defaultValue={effective.editor.hours_title ?? ''} />
                </div>
                <div>
                  <label className="label" htmlFor="contact_title">{tw('contactSectionTitleOptional')}</label>
                  <input id="contact_title" name="contact_title" className="input" defaultValue={effective.editor.contact_title ?? ''} />
                </div>
                <div>
                  <label className="label" htmlFor="contact_body">{tw('contactIntroTextOptional')}</label>
                  <textarea id="contact_body" name="contact_body" className="input min-h-[80px]" defaultValue={effective.editor.contact_body ?? ''} />
                </div>
                <div>
                  <label className="label" htmlFor="footer_note">{tw('footerNoteOptional')}</label>
                  <input id="footer_note" name="footer_note" className="input" defaultValue={effective.editor.footer_note ?? ''} />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary inline-flex items-center">{tw('saveWebsiteDesign')}</button>
          </form>

          <section className="card space-y-3 p-5">
            <p className="section-label">{tw('assetUploads')}</p>
            <p className="text-sm text-loom-muted">{tw('assetUploadsHelp')}</p>
            <Link href="/dashboard/uploads" className="btn-secondary inline-flex items-center">{tw('openUploads')}</Link>
          </section>
        </div>

        <section className="card overflow-hidden p-0">
          <WebsiteLivePreviewSync formId={builderFormId} iframeId={previewIframeId} slug={business.slug} />
          <div className="flex items-center justify-between border-b border-loom-border bg-loom-surface px-4 py-3">
            <p className="text-sm font-medium text-loom-black">{tw('livePreview')}</p>
            <Link href={`/${business.slug}`} className="text-xs font-medium text-loom-accent hover:underline">{t('openFullPage')}</Link>
          </div>
          <iframe
            id={previewIframeId}
            title="Public Website Preview"
            src={`/${business.slug}?preview=${encodeURIComponent(previewToken)}`}
            className="h-[80vh] w-full bg-white"
          />
        </section>
      </div>
    </main>
  )
}
