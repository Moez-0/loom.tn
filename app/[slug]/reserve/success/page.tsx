import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getBusinessBySlug } from '@/lib/businesses'

type SuccessPageProps = {
  params: { slug: string }
}

export default async function ReserveSuccessPage({ params }: SuccessPageProps) {
  const business = await getBusinessBySlug(params.slug)
  const t = await getTranslations('booking')

  if (!business) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-14 sm:px-6">
        <section className="w-full rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2">
            {business.logo_url ? <img src={business.logo_url} alt={business.name} className="h-8 w-8 rounded object-cover" /> : null}
            <span className="text-sm font-semibold text-zinc-800">{business.name}</span>
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900">{t('success')}</h1>
          <p className="mt-3 text-base text-zinc-600">{t('successMessage')}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/${business.slug}`}
              className="rounded-md px-5 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: business.primary_color || '#111827' }}
            >
              {t('backToSite')}
            </Link>
            <Link href={`/${business.slug}/reserve`} className="rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
              {t('bookAnother')}
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
