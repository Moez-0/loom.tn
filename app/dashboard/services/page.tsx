import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTemplateServicesForBusinessType } from '@/lib/business-type-config'
import type { BusinessType } from '@/types'

type Service = {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number | null
  is_active: boolean
}

type BusinessContext = {
  id: string
  type: BusinessType
}

async function getBusinessContext(): Promise<BusinessContext | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/dashboard/services')
  }

  const profile = await ensureUserProfile(user)

  if (!profile?.business_id) {
    return null
  }

  const admin = createAdminClient()

  if (!admin) {
    return null
  }

  const { data } = await admin
    .from('businesses')
    .select('id, type')
    .eq('id', profile.business_id)
    .maybeSingle<BusinessContext>()

  return data ?? null
}

async function getBusinessId() {
  const context = await getBusinessContext()

  return context?.id ?? null
}

async function addService(formData: FormData) {
  'use server'

  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const durationMinutes = Number(formData.get('duration_minutes') ?? 30)
  const priceRaw = String(formData.get('price') ?? '').trim()
  const businessId = await getBusinessId()

  if (!businessId || !name) {
    return
  }

  const admin = createAdminClient()
  if (!admin) {
    return
  }

  await admin.from('services').insert({
    business_id: businessId,
    name,
    description: description || null,
    duration_minutes: Number.isFinite(durationMinutes) ? durationMinutes : 30,
    price: priceRaw ? Number(priceRaw) : null,
  })

  revalidatePath('/dashboard/services')
}

async function updateService(formData: FormData) {
  'use server'

  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const durationMinutes = Number(formData.get('duration_minutes') ?? 30)
  const priceRaw = String(formData.get('price') ?? '').trim()
  const businessId = await getBusinessId()

  if (!businessId || !id || !name) {
    return
  }

  const admin = createAdminClient()
  if (!admin) {
    return
  }

  await admin
    .from('services')
    .update({
      name,
      description: description || null,
      duration_minutes: Number.isFinite(durationMinutes) ? durationMinutes : 30,
      price: priceRaw ? Number(priceRaw) : null,
    })
    .eq('id', id)
    .eq('business_id', businessId)

  revalidatePath('/dashboard/services')
}

async function toggleService(formData: FormData) {
  'use server'

  const id = String(formData.get('id') ?? '')
  const nextActive = String(formData.get('next_active') ?? '') === 'true'
  const businessId = await getBusinessId()

  if (!businessId || !id) {
    return
  }

  const admin = createAdminClient()
  if (!admin) {
    return
  }

  await admin
    .from('services')
    .update({ is_active: nextActive })
    .eq('id', id)
    .eq('business_id', businessId)

  revalidatePath('/dashboard/services')
}

async function seedTemplateServices() {
  'use server'

  const business = await getBusinessContext()

  if (!business) {
    return
  }

  const defaults = getTemplateServicesForBusinessType(business.type)
  if (defaults.length === 0) {
    return
  }

  const admin = createAdminClient()
  if (!admin) {
    return
  }

  const { data: existing } = await admin
    .from('services')
    .select('name')
    .eq('business_id', business.id)

  const existingNames = new Set((existing ?? []).map((item) => item.name.trim().toLowerCase()))
  const rows = defaults
    .filter((item) => !existingNames.has(item.name.trim().toLowerCase()))
    .map((item) => ({
      business_id: business.id,
      name: item.name,
      description: item.description,
      duration_minutes: item.duration_minutes,
      price: item.price,
    }))

  if (rows.length === 0) {
    return
  }

  await admin.from('services').insert(rows)
  revalidatePath('/dashboard/services')
}

export default async function DashboardServicesPage() {
  const t = await getTranslations('services')
  const business = await getBusinessContext()

  if (!business) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('title')}</h1>
        <p className="mt-4 border border-loom-border bg-loom-white p-4 text-sm text-loom-muted">
          {t('noBusiness')}
        </p>
      </main>
    )
  }

  const defaultServices = getTemplateServicesForBusinessType(business.type)

  const admin = createAdminClient()
  if (!admin) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('title')}</h1>
        <p className="mt-4 border border-loom-error bg-loom-white p-4 text-sm text-loom-error">
          {t('missingServiceRoleKey')}
        </p>
      </main>
    )
  }

  const { data } = await admin
    .from('services')
    .select('id, name, description, duration_minutes, price, is_active')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  const services = (data ?? []) as Service[]

  return (
    <main>
      <p className="section-label">{t('dashboard')}</p>
      <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('title')}</h1>

      {services.length === 0 && defaultServices.length > 0 ? (
        <section className="mt-6 border border-loom-border bg-loom-white p-6">
          <p className="section-label">{t('recommendedTitle')}</p>
          <p className="mt-2 text-sm text-loom-muted">{t('recommendedDescription')}</p>
          <form action={seedTemplateServices} className="mt-4">
            <button type="submit" className="btn-secondary">
              {t('actions.addRecommended')}
            </button>
          </form>
        </section>
      ) : null}

      <section className="mt-6 border border-loom-border bg-loom-white p-6">
        <p className="section-label">{t('addLabel')}</p>
        <form action={addService} className="mt-4 grid gap-4 md:grid-cols-5">
          <input name="name" className="input" placeholder={t('form.name')} required />
          <input name="description" className="input" placeholder={t('form.description')} />
          <input
            name="duration_minutes"
            type="number"
            className="input"
            placeholder={t('form.duration')}
            defaultValue={30}
            min={5}
            required
          />
          <input name="price" type="number" step="0.01" className="input" placeholder={t('form.price')} />
          <button type="submit" className="btn-primary">
            {t('actions.add')}
          </button>
        </form>
      </section>

      <section className="mt-6 overflow-x-auto border border-loom-border bg-loom-white">
        <table className="w-full border-collapse text-left text-[0.938rem]">
          <thead>
            <tr className="border-b border-loom-border bg-loom-surface">
              <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('table.service')}</th>
              <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('table.duration')}</th>
              <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('table.price')}</th>
              <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('table.status')}</th>
              <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-loom-muted" colSpan={5}>
                  {t('empty')}
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.id} className="border-b border-loom-border last:border-b-0 align-top">
                  <td className="px-4 py-3" colSpan={3}>
                    <form action={updateService} className="grid gap-2 md:grid-cols-4">
                      <input type="hidden" name="id" value={service.id} />
                      <input name="name" className="input" defaultValue={service.name} required />
                      <input
                        name="description"
                        className="input"
                        defaultValue={service.description ?? ''}
                      />
                      <input
                        name="duration_minutes"
                        type="number"
                        min={5}
                        className="input"
                        defaultValue={service.duration_minutes}
                        required
                      />
                      <div className="flex gap-2">
                        <input
                          name="price"
                          type="number"
                          step="0.01"
                          className="input"
                          defaultValue={service.price ?? ''}
                        />
                        <button type="submit" className="btn-secondary !px-3 !py-2 !text-xs">
                          {t('actions.save')}
                        </button>
                      </div>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${service.is_active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {service.is_active ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleService}>
                      <input type="hidden" name="id" value={service.id} />
                      <input type="hidden" name="next_active" value={String(!service.is_active)} />
                      <button type="submit" className="btn-secondary !px-3 !py-2 !text-xs">
                        {service.is_active ? t('actions.disable') : t('actions.enable')}
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  )
}
