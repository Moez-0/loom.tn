import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'
import type { BusinessType } from '@/types'

type BusinessSettings = {
  id: string
  slug: string
  type: BusinessType
  name: string
  logo_url: string | null
  cover_image_url: string | null
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  whatsapp_number: string | null
  opening_time: string
  closing_time: string
  slot_duration_minutes: number
  max_covers_per_slot: number
  primary_color: string
  secondary_color: string
}

const STORAGE_BUCKET = 'business-assets'

function normalizeFileName(name: string) {
  const extension = name.split('.').pop()?.toLowerCase() ?? 'bin'
  return extension.replace(/[^a-z0-9]/g, '') || 'bin'
}

async function uploadAsset(
  supabase: Awaited<ReturnType<typeof createClient>>,
  businessId: string,
  field: 'logo' | 'cover',
  file: File
) {
  if (!file || file.size === 0) {
    return null
  }

  const extension = normalizeFileName(file.name)
  const path = `${businessId}/${field}-${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || 'application/octet-stream',
  })

  if (error) {
    return null
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

async function getBusinessId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/dashboard/settings')
  }

  const profile = await ensureUserProfile(user)

  return profile?.business_id ?? null
}

async function updateSettings(formData: FormData) {
  'use server'

  const businessId = await getBusinessId()
  if (!businessId) {
    return
  }

  const supabase = await createClient()

  const logoFile = formData.get('logo_file')
  const coverFile = formData.get('cover_file')
  const uploadedLogoUrl =
    logoFile instanceof File && logoFile.size > 0
      ? await uploadAsset(supabase, businessId, 'logo', logoFile)
      : null
  const uploadedCoverUrl =
    coverFile instanceof File && coverFile.size > 0
      ? await uploadAsset(supabase, businessId, 'cover', coverFile)
      : null

  const payload = {
    name: String(formData.get('name') ?? '').trim(),
    logo_url: uploadedLogoUrl || String(formData.get('logo_url') ?? '').trim() || null,
    cover_image_url: uploadedCoverUrl || String(formData.get('cover_image_url') ?? '').trim() || null,
    description: String(formData.get('description') ?? '').trim() || null,
    address: String(formData.get('address') ?? '').trim() || null,
    phone: String(formData.get('phone') ?? '').trim() || null,
    email: String(formData.get('email') ?? '').trim() || null,
    whatsapp_number: String(formData.get('whatsapp_number') ?? '').trim() || null,
    opening_time: String(formData.get('opening_time') ?? '08:00'),
    closing_time: String(formData.get('closing_time') ?? '20:00'),
    slot_duration_minutes: Number(formData.get('slot_duration_minutes') ?? 30),
    max_covers_per_slot: Number(formData.get('max_covers_per_slot') ?? 20),
    primary_color: String(formData.get('primary_color') ?? '#0A0A0A'),
    secondary_color: String(formData.get('secondary_color') ?? '#FAFAFA'),
  }

  if (!payload.name) {
    return
  }

  const admin = createAdminClient()
  if (!admin) {
    return
  }

  await admin.from('businesses').update(payload).eq('id', businessId)

  revalidatePath('/dashboard/settings')
}

export default async function DashboardSettingsPage() {
  const t = await getTranslations('settings')
  const td = await getTranslations('dashboard')
  const businessId = await getBusinessId()

  if (!businessId) {
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

  const admin = createAdminClient()
  if (!admin) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('title')}</h1>
        <p className="mt-4 border border-loom-error bg-loom-white p-4 text-sm text-loom-error">
          {t('loadError')}: {td('missingServiceRoleKey')}
        </p>
      </main>
    )
  }

  const { data } = await admin
    .from('businesses')
    .select(
      'id, slug, type, name, logo_url, cover_image_url, description, address, phone, email, whatsapp_number, opening_time, closing_time, slot_duration_minutes, max_covers_per_slot, primary_color, secondary_color'
    )
    .eq('id', businessId)
    .single<BusinessSettings>()

  if (!data) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('title')}</h1>
        <p className="mt-4 border border-loom-border bg-loom-white p-4 text-sm text-loom-muted">
          {t('loadError')}
        </p>
      </main>
    )
  }

  return (
    <main className="max-w-4xl">
      <p className="section-label">{t('dashboard')}</p>
      <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('title')}</h1>

      <section className="mt-6 rounded-xl border border-loom-border bg-loom-surface p-5">
        <h2 className="text-base font-semibold text-loom-black">{t('websiteGuideTitle')}</h2>
        <p className="mt-2 text-sm text-loom-muted">
          {t('websiteGuideDescription')}
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-loom-muted">
          <li>{t('heroGalleryItem')}</li>
          <li>{t('aboutContactItem')}</li>
          <li>{data.type === 'restaurant' ? t('offeringsItemMenu') : t('offeringsItemServices')}</li>
          <li>{t('teamItem')}</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/${data.slug}`} className="btn-primary inline-flex items-center">
            {t('previewPublicSite')}
          </Link>
          <Link href="/dashboard/services" className="btn-secondary inline-flex items-center">
            {t('editServices')}
          </Link>
          <Link href="/dashboard/staff" className="btn-secondary inline-flex items-center">
            {t('editStaff')}
          </Link>
        </div>
      </section>

      <form
        action={updateSettings}
        encType="multipart/form-data"
        className="mt-6 space-y-6 border border-loom-border bg-loom-white p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">
              {t('form.businessName')}
            </label>
            <input id="name" name="name" className="input" defaultValue={data.name} required />
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
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              defaultValue={data.email ?? ''}
            />
          </div>
          <div>
            <label className="label" htmlFor="whatsapp_number">
              {t('form.whatsapp')}
            </label>
            <input
              id="whatsapp_number"
              name="whatsapp_number"
              className="input"
              defaultValue={data.whatsapp_number ?? ''}
            />
          </div>
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
          <textarea
            id="description"
            name="description"
            className="input min-h-24"
            defaultValue={data.description ?? ''}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="logo_url">
              {t('form.logoUrl')}
            </label>
            <input id="logo_url" name="logo_url" className="input" defaultValue={data.logo_url ?? ''} />
            <label className="label mt-3" htmlFor="logo_file">
              {t('form.uploadLogo')}
            </label>
            <input id="logo_file" name="logo_file" type="file" accept="image/*" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="cover_image_url">
              {t('form.coverUrl')}
            </label>
            <input
              id="cover_image_url"
              name="cover_image_url"
              className="input"
              defaultValue={data.cover_image_url ?? ''}
            />
            <label className="label mt-3" htmlFor="cover_file">
              {t('form.uploadCover')}
            </label>
            <input id="cover_file" name="cover_file" type="file" accept="image/*" className="input" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="opening_time">
              {t('form.openingTime')}
            </label>
            <input
              id="opening_time"
              name="opening_time"
              type="time"
              className="input font-mono"
              defaultValue={data.opening_time}
            />
          </div>
          <div>
            <label className="label" htmlFor="closing_time">
              {t('form.closingTime')}
            </label>
            <input
              id="closing_time"
              name="closing_time"
              type="time"
              className="input font-mono"
              defaultValue={data.closing_time}
            />
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
              className="input"
              defaultValue={data.slot_duration_minutes}
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
              className="input"
              defaultValue={data.max_covers_per_slot}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="primary_color">
              {t('form.primaryColor')}
            </label>
            <input
              id="primary_color"
              name="primary_color"
              type="color"
              className="input h-11"
              defaultValue={data.primary_color}
            />
          </div>
          <div>
            <label className="label" htmlFor="secondary_color">
              {t('form.secondaryColor')}
            </label>
            <input
              id="secondary_color"
              name="secondary_color"
              type="color"
              className="input h-11"
              defaultValue={data.secondary_color}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary">
          {t('save')}
        </button>
      </form>
    </main>
  )
}
