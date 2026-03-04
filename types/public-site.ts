export type PublicSiteConfig = {
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

export type PublicSiteAssetType = 'gallery' | 'menu'

export type PublicSiteAsset = {
  id: string
  business_id: string
  type: PublicSiteAssetType
  title: string | null
  file_url: string
  sort_order: number
  created_at: string
}
