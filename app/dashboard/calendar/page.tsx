import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatLocalDate, normalizeReservationDate } from '@/lib/date'
import { usesAppointmentTerminology } from '@/lib/business-type-config'

type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'no_show' | 'completed'
type ReservationSource = 'online' | 'phone' | 'whatsapp' | 'walk_in'

type CalendarReservation = {
  id: string
  customer_name: string
  date: string
  time_slot: string
  party_size: number
  status: ReservationStatus
  source: ReservationSource
}

function renderDateGroups({
  dates,
  groups,
  t,
  countNounLabel,
}: {
  dates: string[]
  groups: Record<string, CalendarReservation[]>
  t: Awaited<ReturnType<typeof getTranslations>>
  countNounLabel: string
}) {
  return dates.map((date) => (
    <section key={date} className="rounded-xl border border-loom-border bg-loom-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-loom-black">{date}</h2>
        <span className="text-sm text-loom-muted">{groups[date].length} {countNounLabel}</span>
      </div>

      <div className="space-y-2">
        {groups[date].map((reservation) => (
          <div key={reservation.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-loom-border bg-loom-off-white px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-loom-black">{reservation.customer_name}</p>
              <p className="text-xs text-loom-muted">
                {reservation.time_slot} • {reservation.party_size} {t('calendarGuests')} • {t(`source.${reservation.source}`)}
              </p>
            </div>
            <span className={`badge ${reservation.status === 'confirmed' ? 'badge-confirmed' : reservation.status === 'pending' ? 'badge-pending' : reservation.status === 'cancelled' ? 'badge-cancelled' : reservation.status === 'no_show' ? 'badge-no-show' : 'badge-completed'}`}>
              {t(`status.${reservation.status}`)}
            </span>
          </div>
        ))}
      </div>
    </section>
  ))
}

export default async function DashboardCalendarPage() {
  const t = await getTranslations('dashboard')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/dashboard/calendar')
  }

  const profile = await ensureUserProfile(user)

  if (!profile?.business_id) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('calendar')}</h1>
        <p className="mt-4 border border-loom-border bg-loom-white p-4 text-sm text-loom-muted">{t('noBusiness')}</p>
      </main>
    )
  }

  const admin = createAdminClient()
  if (!admin) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('calendar')}</h1>
        <p className="mt-4 border border-loom-error bg-loom-white p-4 text-sm text-loom-error">{t('missingServiceRoleKey')}</p>
      </main>
    )
  }

  const today = formatLocalDate(new Date())

  const { data, error } = await admin
    .from('reservations')
    .select('id, customer_name, date, time_slot, party_size, status, source')
    .eq('business_id', profile.business_id)
    .limit(250)

  const { data: businessTypeRow } = await admin
    .from('businesses')
    .select('type')
    .eq('id', profile.business_id)
    .maybeSingle<{ type: import('@/types').BusinessType }>()

  const isAppointmentBusiness = Boolean(businessTypeRow?.type && usesAppointmentTerminology(businessTypeRow.type))
  const newEntryLabel = isAppointmentBusiness ? t('newAppointment') : t('newReservation')
  const viewEntriesLabel = isAppointmentBusiness ? t('viewAppointments') : t('viewReservations')
  const loadErrorLabel = isAppointmentBusiness ? t('appointmentsLoadError') : t('reservationsLoadError')
  const upcomingEmptyLabel = isAppointmentBusiness ? t('calendarAppointmentEmpty') : t('calendarEmpty')
  const pastEmptyLabel = isAppointmentBusiness ? t('calendarPastAppointmentEmpty') : t('calendarPastEmpty')
  const countNounLabel = isAppointmentBusiness ? t('calendarAppointments') : t('calendarReservations')

  const reservations = (data ?? []) as CalendarReservation[]

  const normalizedReservations = reservations
    .map((reservation) => {
      const normalizedDate = normalizeReservationDate(reservation.date)
      return normalizedDate
        ? {
            ...reservation,
            date: normalizedDate,
          }
        : null
    })
    .filter((reservation): reservation is CalendarReservation => Boolean(reservation))

  const upcomingReservations = normalizedReservations
    .filter((reservation) => reservation.date >= today)
    .sort((first, second) => {
      if (first.date !== second.date) {
        return first.date.localeCompare(second.date)
      }
      return first.time_slot.localeCompare(second.time_slot)
    })

  const pastReservations = normalizedReservations
    .filter((reservation) => reservation.date < today)
    .sort((first, second) => {
      if (first.date !== second.date) {
        return second.date.localeCompare(first.date)
      }
      return second.time_slot.localeCompare(first.time_slot)
    })

  const upcomingGroups = upcomingReservations.reduce<Record<string, CalendarReservation[]>>((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = []
    }
    acc[item.date].push(item)
    return acc
  }, {})

  const pastGroups = pastReservations.reduce<Record<string, CalendarReservation[]>>((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = []
    }
    acc[item.date].push(item)
    return acc
  }, {})

  const upcomingDates = Object.keys(upcomingGroups)
  const pastDates = Object.keys(pastGroups)

  return (
    <main>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">{t('dashboard')}</p>
          <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('calendar')}</h1>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          <Link href="/dashboard/reservations/new" className="btn-primary inline-flex items-center">
            {newEntryLabel}
          </Link>
          <Link href="/dashboard/reservations" className="btn-secondary inline-flex items-center">
            {viewEntriesLabel}
          </Link>
        </div>
      </div>

      {error ? (
        <p className="mb-6 border border-loom-error bg-loom-white p-4 text-sm text-loom-error">
          {loadErrorLabel}: {error.message}
        </p>
      ) : null}

      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-loom-muted">{t('calendarUpcoming')}</h2>
          {upcomingDates.length === 0 ? (
            <div className="rounded-xl border border-loom-border bg-loom-surface p-8 text-sm text-loom-muted">
              {upcomingEmptyLabel}
            </div>
          ) : (
            <div className="space-y-4">{renderDateGroups({ dates: upcomingDates, groups: upcomingGroups, t, countNounLabel })}</div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-loom-muted">{t('calendarPast')}</h2>
          {pastDates.length === 0 ? (
            <div className="rounded-xl border border-loom-border bg-loom-surface p-8 text-sm text-loom-muted">
              {pastEmptyLabel}
            </div>
          ) : (
            <div className="space-y-4">{renderDateGroups({ dates: pastDates, groups: pastGroups, t, countNounLabel })}</div>
          )}
        </section>
      </div>
    </main>
  )
}
