import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'
import { usesAppointmentTerminology } from '@/lib/business-type-config'
import { formatLocalDate, getLastLocalDates, isDateWithinRange, normalizeReservationDate } from '@/lib/date'
import OwnerAnalyticsCharts from '@/components/dashboard/OwnerAnalyticsCharts'

type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'no_show' | 'completed'
type ReservationSource = 'online' | 'phone' | 'whatsapp' | 'walk_in'

type ReservationAnalyticsRow = {
  date: string
  created_at: string | null
  status: ReservationStatus
  source: ReservationSource
}

export default async function DashboardAnalyticsPage() {
  const t = await getTranslations('dashboard')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/dashboard/analytics')
  }

  const profile = await ensureUserProfile(user)

  if (!profile?.business_id) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('analytics')}</h1>
        <p className="mt-4 border border-loom-border bg-loom-white p-4 text-sm text-loom-muted">{t('noBusiness')}</p>
      </main>
    )
  }

  const admin = createAdminClient()
  if (!admin) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('analytics')}</h1>
        <p className="mt-4 border border-loom-error bg-loom-white p-4 text-sm text-loom-error">{t('missingServiceRoleKey')}</p>
      </main>
    )
  }

  const days = getLastLocalDates(14)
  const fromDate = days[0]
  const today = formatLocalDate(new Date())

  const { data, error } = await admin
    .from('reservations')
    .select('date, created_at, status, source')
    .eq('business_id', profile.business_id)

  const { data: businessTypeRow } = await admin
    .from('businesses')
    .select('type')
    .eq('id', profile.business_id)
    .maybeSingle<{ type: import('@/types').BusinessType }>()

  const isAppointmentBusiness = Boolean(businessTypeRow?.type && usesAppointmentTerminology(businessTypeRow.type))
  const viewEntriesLabel = isAppointmentBusiness ? t('viewAppointments') : t('viewReservations')
  const loadErrorLabel = isAppointmentBusiness ? t('appointmentsLoadError') : t('reservationsLoadError')
  const total14dLabel = isAppointmentBusiness ? t('analyticsCards.total14dAppointments') : t('analyticsCards.total14d')

  const allRows = (data ?? []) as ReservationAnalyticsRow[]
  const rows = allRows.filter((row) => {
    const normalizedDate = normalizeReservationDate(row.created_at ?? row.date)
    return normalizedDate ? isDateWithinRange(normalizedDate, fromDate, today) : false
  })

  const totalsByStatus: Record<ReservationStatus, number> = {
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    no_show: 0,
    completed: 0,
  }

  const totalsBySource: Record<ReservationSource, number> = {
    online: 0,
    phone: 0,
    whatsapp: 0,
    walk_in: 0,
  }

  const totalsByDay = new Map<string, number>(days.map((day) => [day, 0]))

  for (const row of rows) {
    const normalizedDate = normalizeReservationDate(row.created_at ?? row.date)
    if (!normalizedDate) {
      continue
    }

    totalsByStatus[row.status] += 1
    totalsBySource[row.source] += 1
    totalsByDay.set(normalizedDate, (totalsByDay.get(normalizedDate) ?? 0) + 1)
  }

  const statusData = [
    { name: t('status.pending'), value: totalsByStatus.pending },
    { name: t('status.confirmed'), value: totalsByStatus.confirmed },
    { name: t('status.cancelled'), value: totalsByStatus.cancelled },
    { name: t('status.no_show'), value: totalsByStatus.no_show },
    { name: t('status.completed'), value: totalsByStatus.completed },
  ]

  const sourceData = [
    { name: t('source.online'), value: totalsBySource.online },
    { name: t('source.phone'), value: totalsBySource.phone },
    { name: t('source.whatsapp'), value: totalsBySource.whatsapp },
    { name: t('source.walk_in'), value: totalsBySource.walk_in },
  ]

  const dailyData = days.map((day) => ({
    day: day.slice(5),
    reservations: totalsByDay.get(day) ?? 0,
  }))

  return (
    <main>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">{t('dashboard')}</p>
          <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('analytics')}</h1>
        </div>
        <Link href="/dashboard/reservations" className="btn-secondary inline-flex items-center">
          {viewEntriesLabel}
        </Link>
      </div>

      {error ? (
        <p className="mb-6 border border-loom-error bg-loom-white p-4 text-sm text-loom-error">
          {loadErrorLabel}: {error.message}
        </p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-loom-border bg-loom-surface p-6">
          <p className="section-label">{total14dLabel}</p>
          <p className="mt-3 text-3xl font-bold text-loom-black">{rows.length}</p>
        </article>
        <article className="rounded-xl border border-loom-border bg-loom-surface p-6">
          <p className="section-label">{t('analyticsCards.confirmationRate')}</p>
          <p className="mt-3 text-3xl font-bold text-loom-black">
            {rows.length ? Math.round((totalsByStatus.confirmed / rows.length) * 100) : 0}%
          </p>
        </article>
        <article className="rounded-xl border border-loom-border bg-loom-surface p-6">
          <p className="section-label">{t('analyticsCards.noShowRate')}</p>
          <p className="mt-3 text-3xl font-bold text-loom-black">
            {rows.length ? Math.round((totalsByStatus.no_show / rows.length) * 100) : 0}%
          </p>
        </article>
      </section>

      <OwnerAnalyticsCharts
        statusData={statusData}
        sourceData={sourceData}
        dailyData={dailyData}
        statusTitle={t('analyticsSections.byStatus')}
        sourceTitle={t('analyticsSections.bySource')}
        trendTitle={t('analyticsSections.dailyTrend')}
      />
    </main>
  )
}
