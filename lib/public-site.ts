import type { PublicSiteAsset, PublicSiteAssetType, PublicSiteConfig } from '@/types/public-site'

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
}

export function getDefaultPublicSiteConfig(): PublicSiteConfig {
  return { ...DEFAULT_PUBLIC_SITE_CONFIG }
}

export async function getPublicSiteConfig(
  admin: { from: (table: string) => any },
  businessId: string
): Promise<PublicSiteConfig> {
  const { data, error } = await admin
    .from('business_public_sites')
    .select(
      'show_gallery, show_team, show_map, show_hours, show_contact, show_offerings, tagline, hero_cta_label, secondary_cta_label'
    )
    .eq('business_id', businessId)
    .maybeSingle<PublicSiteConfigRow>()

  if (error || !data) {
    return getDefaultPublicSiteConfig()
  }

  return {
    ...DEFAULT_PUBLIC_SITE_CONFIG,
    ...data,
  }
}

export async function savePublicSiteConfig(
  admin: { from: (table: string) => any },
  businessId: string,
  config: PublicSiteConfig
) {
  const payload = {
    business_id: businessId,
    ...config,
  }

  await admin.from('business_public_sites').upsert(payload, {
    onConflict: 'business_id',
  })
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
  admin: { from: (table: string) => any },
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
  admin: { from: (table: string) => any },
  payload: Omit<PublicSiteAssetRow, 'id' | 'created_at'>
) {
  await admin.from('business_public_assets').insert(payload)
}

export async function deletePublicSiteAsset(
  admin: { from: (table: string) => any },
  businessId: string,
  assetId: string
) {
  await admin.from('business_public_assets').delete().eq('id', assetId).eq('business_id', businessId)
}
