import BusinessWebsite from '@/components/templates/shared/BusinessWebsite'
import type { TemplateProps } from '@/types/template'

export default function SalonTemplate({ business, services, staff, publicConfig, publicAssets }: TemplateProps) {
  return (
    <BusinessWebsite
      business={business}
      services={services}
      staff={staff}
      publicConfig={publicConfig}
      publicAssets={publicAssets}
      typeLabelKey="salonLabel"
      offeringsTitleKey="servicesLabel"
    />
  )
}
