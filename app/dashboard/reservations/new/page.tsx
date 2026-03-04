import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'

async function createManualReservation(formData: FormData) {
  'use server'

  const customer_name = String(formData.get('customer_name') ?? '').trim()
  const customer_phone = String(formData.get('customer_phone') ?? '').trim()
  const customer_email = String(formData.get('customer_email') ?? '').trim()
  const date = String(formData.get('date') ?? '').trim()
  const time_slot = String(formData.get('time_slot') ?? '').trim()
  const party_size = Number(formData.get('party_size') ?? 1)
  const source = String(formData.get('source') ?? 'phone')
  const special_requests = String(formData.get('special_requests') ?? '').trim()

  if (!customer_name || !customer_phone || !date || !time_slot || Number.isNaN(party_size) || party_size < 1) {
    redirect('/dashboard/reservations/new?error=invalid')
  }

  if (!['phone', 'whatsapp', 'walk_in'].includes(source)) {
    redirect('/dashboard/reservations/new?error=invalid')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/dashboard/reservations/new')
  }

  const profile = await ensureUserProfile(user)

  if (!profile?.business_id) {
    redirect('/dashboard/reservations?error=no-business')
  }

  const admin = createAdminClient()
  if (!admin) {
    redirect('/dashboard/reservations/new?error=insert')
  }

  const { error } = await admin.from('reservations').insert({
    business_id: profile.business_id,
    customer_name,
    customer_phone,
    customer_email: customer_email || null,
    date,
    time_slot,
    party_size,
    status: 'pending',
    source,
    special_requests: special_requests || null,
  })

  if (error) {
    redirect('/dashboard/reservations/new?error=insert')
  }

  revalidatePath('/dashboard/reservations')
  redirect('/dashboard/reservations?created=1')
}

export default async function NewManualReservationPage({
  searchParams,
}: {
  searchParams?: { error?: string }
}) {
  const t = await getTranslations('dashboard')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/dashboard/reservations/new')
  }

  const profile = await ensureUserProfile(user)

  if (!profile?.business_id) {
    return (
      <main>
        <p className="section-label">{t('reservations')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('newReservation')}</h1>
        <p className="mt-4 border border-loom-border bg-loom-white p-4 text-sm text-loom-muted">{t('noBusiness')}</p>
      </main>
    )
  }

  return (
    <main>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">{t('dashboard')}</p>
          <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('newReservation')}</h1>
        </div>
        <Link href="/dashboard/reservations" className="btn-secondary inline-flex items-center">
          {t('backToReservations')}
        </Link>
      </div>

      {searchParams?.error ? (
        <p className="mb-6 border border-loom-error bg-loom-white p-4 text-sm text-loom-error">{t('manualCreateError')}</p>
      ) : null}

      <form action={createManualReservation} className="card max-w-3xl space-y-5 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="customer_name" className="label">
              {t('manualForm.name')}
            </label>
            <input id="customer_name" name="customer_name" className="input" required />
          </div>
          <div>
            <label htmlFor="customer_phone" className="label">
              {t('manualForm.phone')}
            </label>
            <input id="customer_phone" name="customer_phone" className="input" required />
          </div>
          <div>
            <label htmlFor="customer_email" className="label">
              {t('manualForm.email')}
            </label>
            <input id="customer_email" name="customer_email" type="email" className="input" />
          </div>
          <div>
            <label htmlFor="party_size" className="label">
              {t('manualForm.partySize')}
            </label>
            <input id="party_size" name="party_size" type="number" min={1} max={20} defaultValue={1} className="input" required />
          </div>
          <div>
            <label htmlFor="date" className="label">
              {t('manualForm.date')}
            </label>
            <input id="date" name="date" type="date" className="input" required />
          </div>
          <div>
            <label htmlFor="time_slot" className="label">
              {t('manualForm.time')}
            </label>
            <input id="time_slot" name="time_slot" type="time" className="input" required />
          </div>
          <div>
            <label htmlFor="source" className="label">
              {t('manualForm.source')}
            </label>
            <select id="source" name="source" className="input" defaultValue="phone" required>
              <option value="phone">{t('source.phone')}</option>
              <option value="whatsapp">{t('source.whatsapp')}</option>
              <option value="walk_in">{t('source.walk_in')}</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="special_requests" className="label">
            {t('manualForm.notes')}
          </label>
          <textarea id="special_requests" name="special_requests" className="input min-h-[120px]" />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary inline-flex items-center">
            {t('manualForm.submit')}
          </button>
          <Link href="/dashboard/reservations" className="btn-secondary inline-flex items-center">
            {t('cancel')}
          </Link>
        </div>
      </form>
    </main>
  )
}
