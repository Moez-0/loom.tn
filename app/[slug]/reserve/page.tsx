import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getBusinessBySlug } from '@/lib/businesses'
import { createClient } from '@/lib/supabase/server'
import BookingForm from '@/components/booking/BookingForm'
import type { Service, StaffMember } from '@/types'

type ReservePageProps = {
  params: { slug: string }
}

export default async function ReservePage({ params }: ReservePageProps) {
  const business = await getBusinessBySlug(params.slug)
  const t = await getTranslations('booking')

  if (!business) {
    notFound()
  }

  const supabase = await createClient()
  const [{ data: services }, { data: staff }] = await Promise.all([
    supabase
      .from('services')
      .select('id, business_id, name, description, duration_minutes, price, is_active')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true }),
    supabase
      .from('staff_members')
      .select('id, business_id, name, role, avatar_url, is_active')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true }),
  ])

  return (
    <main className="min-h-screen bg-zinc-50">
      <section
        className="border-b border-zinc-200"
        style={
          business.cover_image_url
            ? {
                backgroundImage: `url(${business.cover_image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        <div className={`${business.cover_image_url ? 'bg-black/55' : 'bg-zinc-900'} py-14`}>
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              {business.logo_url ? <img src={business.logo_url} alt={business.name} className="h-11 w-11 rounded object-cover" /> : null}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">{t('reservationLabel')}</p>
                <h1 className="text-2xl font-bold tracking-tight text-white">{business.name}</h1>
              </div>
            </div>
            <Link href={`/${business.slug}`} className="rounded-md border border-white/35 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
              {t('backToSite')}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">{t('title')}</h2>
          <p className="mt-2 text-sm text-zinc-600">{t('bookDirectly', { name: business.name })}</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <BookingForm
            businessId={business.id}
            slug={business.slug}
            businessType={business.type}
            services={(services ?? []) as Service[]}
            staff={(staff ?? []) as StaffMember[]}
            brand={{
              name: business.name,
              logoUrl: business.logo_url,
              primaryColor: business.primary_color,
              secondaryColor: business.secondary_color,
            }}
          />
        </div>
      </section>
    </main>
  )
}
