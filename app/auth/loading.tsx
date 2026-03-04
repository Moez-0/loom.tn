import { getTranslations } from 'next-intl/server'
import BrandSplash from '@/components/ui/BrandSplash'

export default async function AuthLoading() {
  const t = await getTranslations('loading')
  return <BrandSplash title={t('authenticationTitle')} subtitle={t('securingSession')} fullScreen={false} />
}
