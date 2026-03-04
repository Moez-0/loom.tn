import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'

type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'no_show' | 'completed'
type ReservationSource = 'online' | 'phone' | 'whatsapp' | 'walk_in'

type ReservationRow = {
  id: string
  business_id: string
  customer_name: string
  date: string
  time_slot: string
  party_size: number
  status: ReservationStatus
  source: ReservationSource
}

type BusinessRow = {
  id: string
  name: string
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export default async function AdminCalendarPage() {
  const t = await getTranslations('admin')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/admin/calendar')
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
            {t('loadError')}: {t('missingServiceRoleKey')}
        </p>
      </main>
    )
  }

  const today = formatDate(new Date())

  const [{ data: reservationsData, error }, { data: businessesData }] = await Promise.all([
    admin
      .from('reservations')
      .select('id, business_id, customer_name, date, time_slot, party_size, status, source')
      .gte('date', today)
      .order('date', { ascending: true })
      .order('time_slot', { ascending: true })
      .limit(300),
    admin.from('businesses').select('id, name'),
  ])

  const reservations = (reservationsData ?? []) as ReservationRow[]
  const businesses = (businessesData ?? []) as BusinessRow[]

  const businessMap = new Map<string, string>(businesses.map((item) => [item.id, item.name]))

  const groups = reservations.reduce<Record<string, ReservationRow[]>>((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = []
    }
    acc[item.date].push(item)
    return acc
  }, {})

  const dates = Object.keys(groups)

  return (
    <main>
      <div className="mb-8">
        <p className="section-label">{t('admin')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('calendar')}</h1>
      </div>

      {error ? (
        <p className="mb-6 border border-loom-error bg-loom-white p-4 text-sm text-loom-error">
          {t('loadError')}: {error.message}
        </p>
      ) : null}

      {dates.length === 0 ? (
        <div className="rounded-xl border border-loom-border bg-loom-surface p-8 text-sm text-loom-muted">
          {t('calendarEmpty')}
        </div>
      ) : (
        <div className="space-y-4">
          {dates.map((date) => (
            <section key={date} className="rounded-xl border border-loom-border bg-loom-surface p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-loom-black">{date}</h2>
                <span className="text-sm text-loom-muted">{groups[date].length} {t('calendarReservations')}</span>
              </div>
              <div className="space-y-2">
                {groups[date].map((reservation) => (
                  <div key={reservation.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-loom-border bg-loom-off-white px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-loom-black">{reservation.customer_name}</p>
                      <p className="text-xs text-loom-muted">
                        {reservation.time_slot} • {reservation.party_size} {t('calendarGuests')} • {t(`source.${reservation.source}`)}
                      </p>
                      <p className="text-xs text-loom-muted">{businessMap.get(reservation.business_id) ?? reservation.business_id}</p>
                    </div>
                    <span className={`badge ${reservation.status === 'confirmed' ? 'badge-confirmed' : reservation.status === 'pending' ? 'badge-pending' : reservation.status === 'cancelled' ? 'badge-cancelled' : reservation.status === 'no_show' ? 'badge-no-show' : 'badge-completed'}`}>
                      {t(`status.${reservation.status}`)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}
