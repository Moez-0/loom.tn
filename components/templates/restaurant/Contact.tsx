import type { Business } from '@/types'
import { getTranslations } from 'next-intl/server'

type ContactProps = {
  business: Business
}

export default async function Contact({ business }: ContactProps) {
  const t = await getTranslations('public')
  const mapsQuery = encodeURIComponent(business.address || business.name)

  return (
    <section className="py-20">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-6 md:grid-cols-2">
        <div>
          <p className="section-label">{t('contactLabel')}</p>
          <div className="mt-6 space-y-3 text-base text-loom-muted">
            <p>{business.address || t('addressFallback')}</p>
            <p>{business.phone || t('phoneFallback')}</p>
            <p>{business.email || t('emailFallback')}</p>
            {business.whatsapp_number ? (
              <a
                className="inline-flex border-b border-loom-border-dark text-loom-black"
                href={`https://wa.me/${business.whatsapp_number.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
              >
                {t('whatsappLabel')}
              </a>
            ) : null}
          </div>
        </div>
        <div className="border border-loom-border bg-loom-white">
          <iframe
            title="Google Maps"
            src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
            className="h-[320px] w-full"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
