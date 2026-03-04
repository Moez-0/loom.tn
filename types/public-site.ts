export type PublicSiteSectionKey = 'about' | 'offerings' | 'gallery' | 'team' | 'hours' | 'contact'

export type PublicSiteThemePreset = 'classic' | 'soft' | 'bold'

export type PublicSiteHeroAlignment = 'left' | 'center'

export type PublicSiteButtonStyle = 'rounded' | 'pill'

export type PublicSiteColorPreset = 'neutral' | 'ocean' | 'forest' | 'charcoal'

export type PublicSiteEditorConfig = {
  theme_preset: PublicSiteThemePreset
  color_preset: PublicSiteColorPreset
  hero_alignment: PublicSiteHeroAlignment
  button_style: PublicSiteButtonStyle
  brand_color: string | null
  background_color: string | null
  surface_color: string | null
  page_background_color: string | null
  section_background_color: string | null
  card_background_color: string | null
  text_color: string | null
  gallery_columns: 2 | 3 | 4
  section_order: PublicSiteSectionKey[]
  nav_cta_label: string | null
  hero_title: string | null
  about_title: string | null
  about_body: string | null
  offerings_title: string | null
  gallery_title: string | null
  team_title: string | null
  hours_title: string | null
  contact_title: string | null
  contact_body: string | null
  footer_note: string | null
}

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
  editor: PublicSiteEditorConfig
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
