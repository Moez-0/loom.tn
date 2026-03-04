import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'
import ReservationTable, { type DashboardReservation } from '@/components/dashboard/ReservationTable'

type ReservationRow = DashboardReservation

async function updateReservationStatus(formData: FormData) {
  'use server'

  const reservationId = String(formData.get('reservationId') ?? '')
  const status = String(formData.get('status') ?? '') as ReservationRow['status']

  if (!reservationId || !['confirmed', 'cancelled', 'no_show'].includes(status)) {
    return
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/dashboard/reservations')
  }

  const profile = await ensureUserProfile(user)

  if (!profile?.business_id) {
    return
  }

  const admin = createAdminClient()
  if (!admin) {
    return
  }

  await admin
    .from('reservations')
    .update({ status })
    .eq('id', reservationId)
    .eq('business_id', profile.business_id)

  revalidatePath('/dashboard/reservations')
}

export default async function DashboardReservationsPage({
  searchParams,
}: {
  searchParams?: {
    q?: string
    status?: string
    date?: string
  }
}) {
  const t = await getTranslations('dashboard')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/dashboard/reservations')
  }

  const profile = await ensureUserProfile(user)

  if (!profile?.business_id) {
    return (
      <main>
        <p className="section-label">{t('reservations')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('reservations')}</h1>
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
        <p className="section-label">{t('reservations')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('reservations')}</h1>
        <p className="mt-4 border border-loom-error bg-loom-white p-4 text-sm text-loom-error">
          {t('missingServiceRoleKey')}
        </p>
      </main>
    )
  }

  const queryText = searchParams?.q?.trim() || ''
  const statusFilter = searchParams?.status || ''
  const dateFilter = searchParams?.date || ''

  let query = admin
    .from('reservations')
    .select('id, customer_name, customer_phone, date, time_slot, party_size, status, source')
    .eq('business_id', profile.business_id)

  if (queryText) {
    const escaped = queryText.replace(/,/g, ' ')
    query = query.or(`customer_name.ilike.%${escaped}%,customer_phone.ilike.%${escaped}%`)
  }

  if (statusFilter && ['pending', 'confirmed', 'cancelled', 'no_show', 'completed'].includes(statusFilter)) {
    query = query.eq('status', statusFilter)
  }

  if (dateFilter) {
    query = query.eq('date', dateFilter)
  }

  const { data, error } = await query.order('date', { ascending: true }).order('time_slot', { ascending: true })

  const reservations = (data ?? []) as ReservationRow[]

  return (
    <main>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">{t('dashboard')}</p>
          <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('reservations')}</h1>
        </div>
        <Link href="/dashboard/reservations/new" className="btn-primary inline-flex items-center">
          {t('newReservation')}
        </Link>
      </div>

      <form className="mb-6 grid gap-3 border border-loom-border bg-loom-white p-4 md:grid-cols-[1.2fr_0.9fr_0.9fr_auto_auto] md:items-end">
        <div>
          <label className="label" htmlFor="q">{t('filters.search')}</label>
          <input
            id="q"
            name="q"
            className="input"
            defaultValue={queryText}
            placeholder={t('filters.searchPlaceholder')}
          />
        </div>
        <div>
          <label className="label" htmlFor="status">{t('filters.status')}</label>
          <select id="status" name="status" className="input" defaultValue={statusFilter}>
            <option value="">{t('filters.allStatuses')}</option>
            <option value="pending">{t('status.pending')}</option>
            <option value="confirmed">{t('status.confirmed')}</option>
            <option value="cancelled">{t('status.cancelled')}</option>
            <option value="no_show">{t('status.no_show')}</option>
            <option value="completed">{t('status.completed')}</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="date">{t('filters.date')}</label>
          <input id="date" name="date" type="date" className="input" defaultValue={dateFilter} />
        </div>
        <button type="submit" className="btn-secondary !px-4 !py-2 !text-xs">
          {t('filters.apply')}
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/reservations" className="btn-secondary !px-4 !py-2 !text-xs">
            {t('filters.reset')}
          </Link>
          <Link
            href={`/api/reservations/export?q=${encodeURIComponent(queryText)}&status=${encodeURIComponent(statusFilter)}&date=${encodeURIComponent(dateFilter)}`}
            className="btn-primary !px-4 !py-2 !text-xs"
          >
            {t('filters.export')}
          </Link>
        </div>
      </form>

      {error ? (
        <p className="border border-loom-error bg-loom-white p-4 text-sm text-loom-error">
          {t('reservationsLoadError')}: {error.message}
        </p>
      ) : (
        <ReservationTable
          reservations={reservations}
          onUpdateStatus={updateReservationStatus}
          text={{
            date: t('table.date'),
            time: t('table.time'),
            guest: t('table.guest'),
            party: t('table.party'),
            source: t('table.source'),
            status: t('table.status'),
            actions: t('table.actions'),
            empty: t('reservationsEmpty'),
            sourceLabel: {
              online: t('source.online'),
              phone: t('source.phone'),
              whatsapp: t('source.whatsapp'),
              walk_in: t('source.walk_in'),
            },
            statusLabel: {
              pending: t('status.pending'),
              confirmed: t('status.confirmed'),
              cancelled: t('status.cancelled'),
              no_show: t('status.no_show'),
              completed: t('status.completed'),
            },
            confirm: t('actions.confirm'),
            cancel: t('actions.cancel'),
            noShow: t('actions.noShow'),
          }}
        />
      )}
    </main>
  )
}
