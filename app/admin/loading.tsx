import { getTranslations } from 'next-intl/server'
import BrandSplash from '@/components/ui/BrandSplash'

export default async function AdminLoading() {
  const t = await getTranslations('loading')
  return <BrandSplash title={t('adminConsoleTitle')} subtitle={t('loadingAdminTools')} fullScreen={false} />
}
