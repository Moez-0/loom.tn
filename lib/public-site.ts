import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  PublicSiteAsset,
  PublicSiteAssetType,
  PublicSiteConfig,
  PublicSiteEditorConfig,
  PublicSiteSectionKey,
} from '@/types/public-site'

const DEFAULT_SECTION_ORDER: PublicSiteSectionKey[] = ['about', 'offerings', 'gallery', 'team', 'hours', 'contact']

const DEFAULT_PUBLIC_SITE_EDITOR_CONFIG: PublicSiteEditorConfig = {
  theme_preset: 'classic',
  color_preset: 'neutral',
  hero_alignment: 'left',
  button_style: 'rounded',
  brand_color: null,
  background_color: null,
  surface_color: null,
  page_background_color: null,
  section_background_color: null,
  card_background_color: null,
  text_color: null,
  gallery_columns: 4,
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

function sanitizeSectionOrder(value: unknown): PublicSiteSectionKey[] {
  if (!Array.isArray(value)) {
    return [...DEFAULT_SECTION_ORDER]
  }

  const allowed = new Set<PublicSiteSectionKey>(DEFAULT_SECTION_ORDER)
  const unique = value.filter((item): item is PublicSiteSectionKey => typeof item === 'string' && allowed.has(item as PublicSiteSectionKey))
  const deduped = Array.from(new Set(unique))

  return deduped.length === DEFAULT_SECTION_ORDER.length ? deduped : [...DEFAULT_SECTION_ORDER]
}

function toNullableText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function toNullableHexColor(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()
  return /^#[0-9a-f]{6}$/.test(normalized) ? normalized : null
}

function normalizeEditorConfig(value: unknown): PublicSiteEditorConfig {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  return {
    theme_preset: raw.theme_preset === 'soft' || raw.theme_preset === 'bold' ? raw.theme_preset : 'classic',
    color_preset:
      raw.color_preset === 'ocean' || raw.color_preset === 'forest' || raw.color_preset === 'charcoal'
        ? raw.color_preset
        : 'neutral',
    hero_alignment: raw.hero_alignment === 'center' ? 'center' : 'left',
    button_style: raw.button_style === 'pill' ? 'pill' : 'rounded',
    brand_color: toNullableHexColor(raw.brand_color),
    background_color: toNullableHexColor(raw.background_color) ?? toNullableHexColor(raw.page_background_color),
    surface_color:
      toNullableHexColor(raw.surface_color) ?? toNullableHexColor(raw.section_background_color) ?? toNullableHexColor(raw.card_background_color),
    page_background_color: toNullableHexColor(raw.page_background_color),
    section_background_color: toNullableHexColor(raw.section_background_color),
    card_background_color: toNullableHexColor(raw.card_background_color),
    text_color: toNullableHexColor(raw.text_color),
    gallery_columns: raw.gallery_columns === 2 || raw.gallery_columns === 3 ? raw.gallery_columns : 4,
    section_order: sanitizeSectionOrder(raw.section_order),
    nav_cta_label: toNullableText(raw.nav_cta_label),
    hero_title: toNullableText(raw.hero_title),
    about_title: toNullableText(raw.about_title),
    about_body: toNullableText(raw.about_body),
    offerings_title: toNullableText(raw.offerings_title),
    gallery_title: toNullableText(raw.gallery_title),
    team_title: toNullableText(raw.team_title),
    hours_title: toNullableText(raw.hours_title),
    contact_title: toNullableText(raw.contact_title),
    contact_body: toNullableText(raw.contact_body),
    footer_note: toNullableText(raw.footer_note),
  }
}

const DEFAULT_PUBLIC_SITE_CONFIG: PublicSiteConfig = {
  show_gallery: true,
  show_team: true,
  show_map: true,
  show_hours: true,
  show_contact: true,
  show_offerings: true,
  tagline: null,
  hero_cta_label: null,
  secondary_cta_label: null,
  editor: DEFAULT_PUBLIC_SITE_EDITOR_CONFIG,
}

type PublicSiteConfigRow = {
  show_gallery: boolean
  show_team: boolean
  show_map: boolean
  show_hours: boolean
  show_contact: boolean
  show_offerings: boolean
  tagline: string | null
  hero_cta_label: string | null
  secondary_cta_label: string | null
  editor_config?: unknown
}

export function getDefaultPublicSiteConfig(): PublicSiteConfig {
  return {
    ...DEFAULT_PUBLIC_SITE_CONFIG,
    editor: { ...DEFAULT_PUBLIC_SITE_EDITOR_CONFIG, section_order: [...DEFAULT_PUBLIC_SITE_EDITOR_CONFIG.section_order] },
  }
}

export async function getPublicSiteConfig(
  admin: SupabaseClient,
  businessId: string
): Promise<PublicSiteConfig> {
  const { data, error } = await admin
    .from('business_public_sites')
    .select('*')
    .eq('business_id', businessId)
    .maybeSingle<PublicSiteConfigRow>()

  if (error || !data) {
    return getDefaultPublicSiteConfig()
  }

  return {
    ...DEFAULT_PUBLIC_SITE_CONFIG,
    ...data,
    editor: normalizeEditorConfig(data.editor_config),
  }
}

export async function savePublicSiteConfig(
  admin: SupabaseClient,
  businessId: string,
  config: PublicSiteConfig
) {
  const payload = {
    business_id: businessId,
    show_gallery: config.show_gallery,
    show_team: config.show_team,
    show_map: config.show_map,
    show_hours: config.show_hours,
    show_contact: config.show_contact,
    show_offerings: config.show_offerings,
    tagline: config.tagline,
    hero_cta_label: config.hero_cta_label,
    secondary_cta_label: config.secondary_cta_label,
    editor_config: config.editor,
  }

  const { error } = await admin.from('business_public_sites').upsert(payload, {
    onConflict: 'business_id',
  })

  if (error && /editor_config/i.test(error.message)) {
    await admin.from('business_public_sites').upsert(
      {
        business_id: businessId,
        show_gallery: config.show_gallery,
        show_team: config.show_team,
        show_map: config.show_map,
        show_hours: config.show_hours,
        show_contact: config.show_contact,
        show_offerings: config.show_offerings,
        tagline: config.tagline,
        hero_cta_label: config.hero_cta_label,
        secondary_cta_label: config.secondary_cta_label,
      },
      {
        onConflict: 'business_id',
      }
    )
  }
}

type PublicSiteAssetRow = {
  id: string
  business_id: string
  type: PublicSiteAssetType
  title: string | null
  file_url: string
  sort_order: number
  created_at: string
}

export async function getPublicSiteAssets(
  admin: SupabaseClient,
  businessId: string
): Promise<PublicSiteAsset[]> {
  const { data, error } = await admin
    .from('business_public_assets')
    .select('id, business_id, type, title, file_url, sort_order, created_at')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    return []
  }

  return (data ?? []) as PublicSiteAsset[]
}

export async function createPublicSiteAsset(
  admin: SupabaseClient,
  payload: Omit<PublicSiteAssetRow, 'id' | 'created_at'>
) {
  await admin.from('business_public_assets').insert(payload)
}

export async function deletePublicSiteAsset(
  admin: SupabaseClient,
  businessId: string,
  assetId: string
) {
  await admin.from('business_public_assets').delete().eq('id', assetId).eq('business_id', businessId)
}
