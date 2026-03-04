import { getTranslations } from 'next-intl/server'
import BrandSplash from '@/components/ui/BrandSplash'

export default async function DashboardLoading() {
  const t = await getTranslations('loading')
  return <BrandSplash title={t('ownerDashboardTitle')} subtitle={t('loadingData')} fullScreen={false} />
}
