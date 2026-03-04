import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'

const businessTypes = ['restaurant', 'cafe', 'bar', 'lounge', 'salon', 'clinic', 'consultancy', 'hotel'] as const
const languages = ['en', 'fr', 'ar'] as const

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function normalizeDomain(value: string) {
  return value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
}

async function updateBusiness(formData: FormData) {
  'use server'

  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const slug = normalizeSlug(String(formData.get('slug') ?? ''))
  const type = String(formData.get('type') ?? '')
  const language = String(formData.get('language') ?? 'fr')
  const custom_domain = normalizeDomain(String(formData.get('custom_domain') ?? ''))
  const phone = String(formData.get('phone') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const address = String(formData.get('address') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const opening_time = String(formData.get('opening_time') ?? '').trim()
  const closing_time = String(formData.get('closing_time') ?? '').trim()
  const slot_duration_minutes = Number(formData.get('slot_duration_minutes') ?? 30)
  const max_covers_per_slot = Number(formData.get('max_covers_per_slot') ?? 20)
  const is_active = formData.get('is_active') === 'on'

  if (!id || !name || !slug || !businessTypes.includes(type as (typeof businessTypes)[number])) {
    redirect(`/admin/businesses/${id}?error=invalid_input`)
  }

  if (!languages.includes(language as (typeof languages)[number])) {
    redirect(`/admin/businesses/${id}?error=invalid_language`)
  }

  if (Number.isNaN(slot_duration_minutes) || Number.isNaN(max_covers_per_slot)) {
    redirect(`/admin/businesses/${id}?error=invalid_numbers`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?next=/admin/businesses/${id}`)
  }

  const profile = await ensureUserProfile(user)

  if (profile?.role !== 'superadmin') {
    redirect('/dashboard')
  }

  const admin = createAdminClient()

  if (!admin) {
    redirect(`/admin/businesses/${id}?error=update_failed`)
  }

  const { error } = await admin
    .from('businesses')
    .update({
      name,
      slug,
      type,
      language,
      custom_domain: custom_domain || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      description: description || null,
      opening_time: opening_time || null,
      closing_time: closing_time || null,
      slot_duration_minutes,
      max_covers_per_slot,
      is_active,
    })
    .eq('id', id)

  if (error) {
    redirect(`/admin/businesses/${id}?error=update_failed`)
  }

  revalidatePath('/admin')
  revalidatePath(`/admin/businesses/${id}`)
  redirect(`/admin/businesses/${id}?saved=1`)
}

type BusinessDetailPageProps = {
  params: {
    id: string
  }
  searchParams?: {
    error?: string
    saved?: string
  }
}

type BusinessDetail = {
  id: string
  name: string
  slug: string
  type: string
  language: string
  custom_domain: string | null
  phone: string | null
  email: string | null
  address: string | null
  description: string | null
  opening_time: string | null
  closing_time: string | null
  slot_duration_minutes: number
  max_covers_per_slot: number
  is_active: boolean
}

export default async function AdminBusinessDetailPage({ params, searchParams }: BusinessDetailPageProps) {
  const t = await getTranslations('admin')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?next=/admin/businesses/${params.id}`)
  }

  const profile = await ensureUserProfile(user)
  if (profile?.role !== 'superadmin') {
    redirect('/dashboard')
  }

  const admin = createAdminClient()

  if (!admin) {
    return (
      <main className="max-w-4xl">
        <p className="border border-loom-error bg-loom-white p-4 text-sm text-loom-error">
          {t('loadError')}: {t('missingServiceRoleKey')}
        </p>
      </main>
    )
  }

  const { data } = await admin
    .from('businesses')
    .select(
      'id, name, slug, type, language, custom_domain, phone, email, address, description, opening_time, closing_time, slot_duration_minutes, max_covers_per_slot, is_active'
    )
    .eq('id', params.id)
    .single<BusinessDetail>()

  if (!data) {
    notFound()
  }

  const publicUrl = data.custom_domain ? `https://${data.custom_domain}` : `/${data.slug}`

  return (
    <main className="max-w-4xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">{t('admin')}</p>
          <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('editBusiness')}</h1>
        </div>
        <Link href="/admin" className="btn-secondary inline-flex items-center">
          {t('backToBusinesses')}
        </Link>
      </div>

      {searchParams?.error ? (
        <p className="mb-6 border border-loom-error bg-loom-white p-4 text-sm text-loom-error">{t('updateError')}</p>
      ) : null}

      {searchParams?.saved ? (
        <p className="mb-6 border border-loom-success bg-loom-white p-4 text-sm text-loom-success">{t('updateSuccess')}</p>
      ) : null}

      <section className="mb-6 border border-loom-border bg-loom-white p-6">
        <p className="section-label">{t('website')}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm text-loom-muted">{t('publicLink')}</p>
            <a href={publicUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex border-b border-loom-border-dark font-mono text-sm text-loom-black">
              {publicUrl}
            </a>
            <div className="mt-2">
              <Link href={`/admin/businesses/${data.id}/website`} className="text-xs font-medium text-loom-accent hover:underline">
                {t('openWebsiteEditor')}
              </Link>
            </div>
          </div>
          <span className={`badge ${data.is_active ? 'badge-confirmed' : 'badge-cancelled'}`}>
            {data.is_active ? t('published') : t('unpublished')}
          </span>
        </div>
      </section>

      <form action={updateBusiness} className="space-y-4 border border-loom-border bg-loom-white p-6">
        <input type="hidden" name="id" value={data.id} />

        <div>
          <label className="label" htmlFor="name">
            {t('form.businessName')}
          </label>
          <input id="name" name="name" className="input" defaultValue={data.name} required />
        </div>

        <div>
          <label className="label" htmlFor="slug">
            {t('form.slug')}
          </label>
          <input id="slug" name="slug" className="input font-mono" defaultValue={data.slug} required />
        </div>

        <div>
          <label className="label" htmlFor="custom_domain">
            {t('form.customDomain')}
          </label>
          <input
            id="custom_domain"
            name="custom_domain"
            className="input font-mono"
            defaultValue={data.custom_domain ?? ''}
            placeholder="booking.cafe-milan.tn"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="type">
              {t('form.businessType')}
            </label>
            <select id="type" name="type" className="input" defaultValue={data.type} required>
              {businessTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="language">
              {t('form.language')}
            </label>
            <select id="language" name="language" className="input" defaultValue={data.language} required>
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="phone">
            {t('form.phone')}
          </label>
          <input id="phone" name="phone" className="input" defaultValue={data.phone ?? ''} />
        </div>

        <div>
          <label className="label" htmlFor="email">
            {t('form.email')}
          </label>
          <input id="email" name="email" type="email" className="input" defaultValue={data.email ?? ''} />
        </div>

        <div>
          <label className="label" htmlFor="address">
            {t('form.address')}
          </label>
          <input id="address" name="address" className="input" defaultValue={data.address ?? ''} />
        </div>

        <div>
          <label className="label" htmlFor="description">
            {t('form.description')}
          </label>
          <textarea id="description" name="description" className="input min-h-[120px]" defaultValue={data.description ?? ''} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="opening_time">
              {t('form.openingTime')}
            </label>
            <input id="opening_time" name="opening_time" type="time" className="input" defaultValue={data.opening_time ?? ''} />
          </div>

          <div>
            <label className="label" htmlFor="closing_time">
              {t('form.closingTime')}
            </label>
            <input id="closing_time" name="closing_time" type="time" className="input" defaultValue={data.closing_time ?? ''} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="slot_duration_minutes">
              {t('form.slotDuration')}
            </label>
            <input
              id="slot_duration_minutes"
              name="slot_duration_minutes"
              type="number"
              min={5}
              max={240}
              className="input"
              defaultValue={data.slot_duration_minutes}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="max_covers_per_slot">
              {t('form.maxCovers')}
            </label>
            <input
              id="max_covers_per_slot"
              name="max_covers_per_slot"
              type="number"
              min={1}
              max={1000}
              className="input"
              defaultValue={data.max_covers_per_slot}
              required
            />
          </div>
        </div>

        <label className="flex items-center gap-2 pt-1 text-sm text-loom-black">
          <input type="checkbox" name="is_active" defaultChecked={data.is_active} />
          {t('active')}
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="btn-primary">
            {t('saveBusiness')}
          </button>
          <Link href="/admin" className="btn-secondary inline-flex items-center">
            {t('cancel')}
          </Link>
        </div>
      </form>
    </main>
  )
}
