import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminAnalyticsCharts from '@/components/admin/AdminAnalyticsCharts'

type BusinessRow = {
  id: string
  name: string
  subscription_status: 'trialing' | 'active' | 'past_due' | 'cancelled'
  is_active: boolean
}

type ReservationRow = {
  business_id: string
  date: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'no_show' | 'completed'
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export default async function AdminAnalyticsPage() {
  const t = await getTranslations('admin')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/admin/analytics')
  }

  const profile = await ensureUserProfile(user)
  if (profile?.role !== 'superadmin') {
    redirect('/dashboard')
  }

  const admin = createAdminClient()
  if (!admin) {
    return (
      <main>
        <p className="border border-loom-error bg-loom-white p-4 text-sm text-loom-error">
          {t('loadError')}: Missing SUPABASE_SERVICE_ROLE_KEY
        </p>
      </main>
    )
  }

  const fromDate = formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))

  const [{ data: businesses }, { data: reservations }] = await Promise.all([
    admin.from('businesses').select('id, name, subscription_status, is_active'),
    admin.from('reservations').select('business_id, date, status').gte('date', fromDate),
  ])

  const businessRows = (businesses ?? []) as BusinessRow[]
  const reservationRows = (reservations ?? []) as ReservationRow[]

  const totals = {
    businesses: businessRows.length,
    activeBusinesses: businessRows.filter((item) => item.is_active).length,
    trialing: businessRows.filter((item) => item.subscription_status === 'trialing').length,
    reservations30d: reservationRows.length,
    confirmed30d: reservationRows.filter((item) => item.status === 'confirmed').length,
  }

  const perBusiness = reservationRows.reduce<Record<string, number>>((acc, row) => {
    acc[row.business_id] = (acc[row.business_id] ?? 0) + 1
    return acc
  }, {})

  const businessNameById = new Map(businessRows.map((business) => [business.id, business.name]))

  const businessLoadData = Object.entries(perBusiness)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([businessId, count]) => ({
      business: businessNameById.get(businessId) ?? `${businessId.slice(0, 8)}…`,
      reservations: count,
    }))

  return (
    <main>
      <div className="mb-8">
        <p className="section-label">{t('admin')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('analytics')}</h1>
      </div>

      <section className="grid gap-4 md:grid-cols-5">
        <article className="rounded-xl border border-loom-border bg-loom-surface p-5">
          <p className="section-label">{t('analyticsCards.businesses')}</p>
          <p className="mt-3 text-3xl font-bold text-loom-black">{totals.businesses}</p>
        </article>
        <article className="rounded-xl border border-loom-border bg-loom-surface p-5">
          <p className="section-label">{t('analyticsCards.activeBusinesses')}</p>
          <p className="mt-3 text-3xl font-bold text-loom-black">{totals.activeBusinesses}</p>
        </article>
        <article className="rounded-xl border border-loom-border bg-loom-surface p-5">
          <p className="section-label">{t('analyticsCards.trialing')}</p>
          <p className="mt-3 text-3xl font-bold text-loom-black">{totals.trialing}</p>
        </article>
        <article className="rounded-xl border border-loom-border bg-loom-surface p-5">
          <p className="section-label">{t('analyticsCards.reservations30d')}</p>
          <p className="mt-3 text-3xl font-bold text-loom-black">{totals.reservations30d}</p>
        </article>
        <article className="rounded-xl border border-loom-border bg-loom-surface p-5">
          <p className="section-label">{t('analyticsCards.confirmedRate')}</p>
          <p className="mt-3 text-3xl font-bold text-loom-black">
            {totals.reservations30d ? Math.round((totals.confirmed30d / totals.reservations30d) * 100) : 0}%
          </p>
        </article>
      </section>

      {businessLoadData.length === 0 ? (
        <section className="mt-6 rounded-xl border border-loom-border bg-loom-surface p-6">
          <h2 className="text-lg font-semibold text-loom-black">{t('analyticsSections.loadByBusiness')}</h2>
          <p className="mt-4 text-sm text-loom-muted">{t('analyticsSections.empty')}</p>
        </section>
      ) : (
        <AdminAnalyticsCharts businessLoad={businessLoadData} title={t('analyticsSections.loadByBusiness')} />
      )}
    </main>
  )
}
