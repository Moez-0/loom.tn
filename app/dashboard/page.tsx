import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'
import { usesAppointmentTerminology } from '@/lib/business-type-config'
import { addDays, formatLocalDate, isDateWithinRange, normalizeReservationDate } from '@/lib/date'
import StatBlock from '@/components/dashboard/StatBlock'

type ReservationDateRow = {
  date: string
  created_at: string | null
}

export default async function DashboardPage() {
  const t = await getTranslations('dashboard')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/dashboard')
  }

  const profile = await ensureUserProfile(user)

  if (!profile?.business_id) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('overview')}</h1>
        <p className="mt-4 border border-loom-border bg-loom-white p-4 text-sm text-loom-muted">
          {t('noBusiness')}
        </p>
      </main>
    )
  }

  const admin = createAdminClient()
  if (!admin) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('overview')}</h1>
        <p className="mt-4 border border-loom-error bg-loom-white p-4 text-sm text-loom-error">
          {t('missingServiceRoleKey')}
        </p>
      </main>
    )
  }

  const now = new Date()
  const today = formatLocalDate(now)
  const weekStart = formatLocalDate(addDays(now, -6))

  const { data } = await admin
    .from('reservations')
    .select('date, created_at')
    .eq('business_id', profile.business_id)

  const { data: businessTypeRow } = await admin
    .from('businesses')
    .select('type')
    .eq('id', profile.business_id)
    .maybeSingle<{ type: import('@/types').BusinessType }>()

  const isAppointmentBusiness = Boolean(businessTypeRow?.type && usesAppointmentTerminology(businessTypeRow.type))
  const viewEntriesLabel = isAppointmentBusiness ? t('viewAppointments') : t('viewReservations')

  const reservations = (data ?? []) as ReservationDateRow[]

  let todayCount = 0
  let weekCount = 0

  for (const reservation of reservations) {
    const normalizedDate = normalizeReservationDate(reservation.created_at ?? reservation.date)
    if (!normalizedDate) {
      continue
    }

    if (normalizedDate === today) {
      todayCount += 1
    }

    if (isDateWithinRange(normalizedDate, weekStart, today)) {
      weekCount += 1
    }
  }

  const totalCount = reservations.length

  const stats = [
    { label: t('today'), value: todayCount },
    { label: t('thisWeek'), value: weekCount },
    { label: t('total'), value: totalCount },
  ]

  return (
    <main>
      <div className="mb-8">
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('overview')}</h1>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatBlock key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </section>

      <div className="mt-8">
        <Link href="/dashboard/reservations" className="btn-primary inline-flex items-center">
          {viewEntriesLabel}
        </Link>
      </div>
    </main>
  )
}
