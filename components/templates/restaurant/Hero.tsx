import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { Business } from '@/types'

type HeroProps = {
  business: Business
}

export default async function Hero({ business }: HeroProps) {
  const t = await getTranslations('public')
  const hasCover = Boolean(business.cover_image_url)

  return (
    <section
      className="border-b border-loom-border"
      style={
        hasCover
          ? {
              backgroundImage: `url(${business.cover_image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      <div className={`${hasCover ? 'bg-loom-black/65' : 'bg-loom-black'} min-h-[60vh]`}>
        <div className="mx-auto flex min-h-[60vh] w-full max-w-[1200px] flex-col justify-end px-6 py-20">
          <p className="section-label text-loom-white">{t('restaurantLabel')}</p>
          <h1 className="mt-6 font-display text-[2.75rem] tracking-[-0.03em] text-loom-white md:text-[4rem]">
            {business.name}
          </h1>
          <div className="mt-8">
            <Link href={`/${business.slug}/reserve`} className="btn-primary inline-flex items-center">
              {t('reserveCta')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
