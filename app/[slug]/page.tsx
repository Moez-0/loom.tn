import { notFound } from 'next/navigation'
import { getBusinessBySlug } from '@/lib/businesses'
import { templateMap } from '@/lib/templates'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDefaultPublicSiteConfig, getPublicSiteAssets, getPublicSiteConfig } from '@/lib/public-site'

type SlugPageProps = {
  params: { slug: string }
}

export default async function SlugPage({ params }: SlugPageProps) {
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

  const Template = templateMap[business.type]

  return (
    <Template
      business={business}
      services={services ?? []}
      staff={staff ?? []}
      publicConfig={publicConfig}
      publicAssets={publicAssets}
    />
  )
}
