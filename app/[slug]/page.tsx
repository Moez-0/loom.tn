import { notFound } from 'next/navigation'
import { getBusinessBySlug } from '@/lib/businesses'
import { templateMap } from '@/lib/templates'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultPublicSiteConfig, getPublicSiteAssets, getPublicSiteConfig } from '@/lib/public-site'
import type { PublicSiteConfig, PublicSiteSectionKey } from '@/types/public-site'

type SlugPageProps = {
  params: { slug: string }
  searchParams?: { draft?: string }
}

const DEFAULT_SECTION_ORDER: PublicSiteSectionKey[] = ['about', 'offerings', 'gallery', 'team', 'hours', 'contact']

function toNullableText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function toNullableColor(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()
  return /^#[0-9a-f]{6}$/.test(normalized) ? normalized : null
}

function toSectionOrder(value: unknown): PublicSiteSectionKey[] {
  if (!Array.isArray(value)) {
    return DEFAULT_SECTION_ORDER
  }

  const allowed = new Set<PublicSiteSectionKey>(DEFAULT_SECTION_ORDER)
  const unique = value.filter((item): item is PublicSiteSectionKey => typeof item === 'string' && allowed.has(item as PublicSiteSectionKey))
  const deduped = Array.from(new Set(unique))

  return deduped.length === DEFAULT_SECTION_ORDER.length ? deduped : DEFAULT_SECTION_ORDER
}

function parseDraftConfig(rawDraft: string | undefined): PublicSiteConfig | null {
  if (!rawDraft) {
    return null
  }

  try {
    const decoded = Buffer.from(rawDraft, 'base64url').toString('utf8')
    const raw = JSON.parse(decoded) as Record<string, unknown>
    const rawEditor = raw.editor && typeof raw.editor === 'object' ? (raw.editor as Record<string, unknown>) : {}

    return {
      show_gallery: raw.show_gallery === true,
      show_team: raw.show_team === true,
      show_map: raw.show_map === true,
      show_hours: raw.show_hours === true,
      show_contact: raw.show_contact === true,
      show_offerings: raw.show_offerings === true,
      tagline: toNullableText(raw.tagline),
      hero_cta_label: toNullableText(raw.hero_cta_label),
      secondary_cta_label: toNullableText(raw.secondary_cta_label),
      editor: {
        theme_preset: rawEditor.theme_preset === 'soft' || rawEditor.theme_preset === 'bold' ? rawEditor.theme_preset : 'classic',
        color_preset:
          rawEditor.color_preset === 'ocean' || rawEditor.color_preset === 'forest' || rawEditor.color_preset === 'charcoal'
            ? rawEditor.color_preset
            : 'neutral',
        hero_alignment: rawEditor.hero_alignment === 'center' ? 'center' : 'left',
        button_style: rawEditor.button_style === 'pill' ? 'pill' : 'rounded',
        brand_color: toNullableColor(rawEditor.brand_color),
        background_color: toNullableColor(rawEditor.background_color) ?? toNullableColor(rawEditor.page_background_color),
        surface_color:
          toNullableColor(rawEditor.surface_color) ?? toNullableColor(rawEditor.section_background_color) ?? toNullableColor(rawEditor.card_background_color),
        page_background_color: toNullableColor(rawEditor.page_background_color),
        section_background_color: toNullableColor(rawEditor.section_background_color),
        card_background_color: toNullableColor(rawEditor.card_background_color),
        text_color: toNullableColor(rawEditor.text_color),
        gallery_columns: rawEditor.gallery_columns === 2 || rawEditor.gallery_columns === 3 ? rawEditor.gallery_columns : 4,
        section_order: toSectionOrder(rawEditor.section_order),
        nav_cta_label: toNullableText(rawEditor.nav_cta_label),
        hero_title: toNullableText(rawEditor.hero_title),
        about_title: toNullableText(rawEditor.about_title),
        about_body: toNullableText(rawEditor.about_body),
        offerings_title: toNullableText(rawEditor.offerings_title),
        gallery_title: toNullableText(rawEditor.gallery_title),
        team_title: toNullableText(rawEditor.team_title),
        hours_title: toNullableText(rawEditor.hours_title),
        contact_title: toNullableText(rawEditor.contact_title),
        contact_body: toNullableText(rawEditor.contact_body),
        footer_note: toNullableText(rawEditor.footer_note),
      },
    }
  } catch {
    return null
  }
}

export default async function SlugPage({ params, searchParams }: SlugPageProps) {
  const business = await getBusinessBySlug(params.slug)

  if (!business) {
    notFound()
  }

  const supabase = await createClient()
  const admin = createAdminClient()
  const [{ data: services }, { data: staff }] = await Promise.all([
    supabase
      .from('services')
      .select('id, business_id, name, description, duration_minutes, price, is_active')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('name', { ascending: true }),
    supabase
      .from('staff_members')
      .select('id, business_id, name, role, avatar_url, is_active')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('name', { ascending: true }),
  ])

  const [publicConfig, publicAssets] = admin
    ? await Promise.all([getPublicSiteConfig(admin, business.id), getPublicSiteAssets(admin, business.id)])
    : [getDefaultPublicSiteConfig(), []]

  const draftConfig = parseDraftConfig(searchParams?.draft)

  const Template = templateMap[business.type]

  return (
    <Template
      business={business}
      services={services ?? []}
      staff={staff ?? []}
      publicConfig={draftConfig ?? publicConfig}
      publicAssets={publicAssets}
    />
  )
}
