import type { Business, Service, StaffMember } from '@/types'
import type { PublicSiteAsset, PublicSiteConfig } from '@/types/public-site'

export type TemplateProps = {
  business: Business
  services?: Service[]
  staff?: StaffMember[]
  publicConfig?: PublicSiteConfig
  publicAssets?: PublicSiteAsset[]
}
