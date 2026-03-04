import type { Business } from '@/types'
import { getTranslations } from 'next-intl/server'

type AboutProps = {
  business: Business
}

export default async function About({ business }: AboutProps) {
  const t = await getTranslations('public')

  return (
    <section className="border-b border-loom-border py-20">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <p className="section-label">{t('aboutLabel')}</p>
        <hr className="divider my-6" />
        <p className="max-w-3xl text-base leading-7 text-loom-muted">
          {business.description || t('aboutFallback')}
        </p>
        <hr className="divider mt-6" />
      </div>
    </section>
  )
}
