import { getTranslations } from 'next-intl/server'
import BrandSplash from '@/components/ui/BrandSplash'

export default async function Loading() {
  const t = await getTranslations('loading')
  return <BrandSplash title="LOOM" subtitle={t('preparingExperience')} fullScreen />
}
