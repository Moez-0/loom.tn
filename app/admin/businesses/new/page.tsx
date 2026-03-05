import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'
import { BUSINESS_TYPE_VALUES } from '@/lib/business-type-config'

const businessTypes = BUSINESS_TYPE_VALUES
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

async function createBusiness(formData: FormData) {
  'use server'

  const name = String(formData.get('name') ?? '').trim()
  const slug = normalizeSlug(String(formData.get('slug') ?? ''))
  const type = String(formData.get('type') ?? '')
  const language = String(formData.get('language') ?? 'fr')
  const custom_domain = normalizeDomain(String(formData.get('custom_domain') ?? ''))
  const phone = String(formData.get('phone') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const address = String(formData.get('address') ?? '').trim()

  if (!name || !slug || !businessTypes.includes(type as (typeof businessTypes)[number])) {
    redirect('/admin/businesses/new?error=invalid_input')
  }

  if (!languages.includes(language as (typeof languages)[number])) {
    redirect('/admin/businesses/new?error=invalid_language')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/admin/businesses/new')
  }

  const profile = await ensureUserProfile(user)

  if (profile?.role !== 'superadmin') {
    redirect('/dashboard')
  }

  const admin = createAdminClient()
  if (!admin) {
    redirect('/admin/businesses/new?error=insert_failed')
  }

  const { error } = await admin.from('businesses').insert({
    name,
    slug,
    type,
    language,
    custom_domain: custom_domain || null,
    is_active: true,
    trial_started_at: new Date().toISOString(),
    trial_ends_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    subscription_status: 'trialing',
    phone: phone || null,
    email: email || null,
    address: address || null,
  })

  if (error) {
    redirect('/admin/businesses/new?error=insert_failed')
  }

  revalidatePath('/admin')
  redirect('/admin?created=1')
}

type NewBusinessPageProps = {
  searchParams: {
    error?: string
  }
}

export default async function NewBusinessPage({ searchParams }: NewBusinessPageProps) {
  const t = await getTranslations('admin')
  const hasError = Boolean(searchParams.error)

  return (
    <main className="max-w-3xl">
      <div className="mb-8">
        <p className="section-label">{t('admin')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">
          {t('addNewBusiness')}
        </h1>
      </div>

      {hasError ? (
        <p className="mb-6 border border-loom-error bg-loom-white p-4 text-sm text-loom-error">
          {t('createError')}
        </p>
      ) : null}

      <form action={createBusiness} className="space-y-4 border border-loom-border bg-loom-white p-6">
        <div>
          <label className="label" htmlFor="name">
            {t('form.businessName')}
          </label>
          <input id="name" name="name" className="input" required />
        </div>

        <div>
          <label className="label" htmlFor="slug">
            {t('form.slug')}
          </label>
          <input id="slug" name="slug" className="input font-mono" placeholder="cafe-milan" required />
        </div>

        <div>
          <label className="label" htmlFor="custom_domain">
            {t('form.customDomain')}
          </label>
          <input id="custom_domain" name="custom_domain" className="input font-mono" placeholder="booking.cafe-milan.tn" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="type">
              {t('form.businessType')}
            </label>
            <select id="type" name="type" className="input" defaultValue="restaurant" required>
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
            <select id="language" name="language" className="input" defaultValue="fr" required>
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
          <input id="phone" name="phone" className="input" />
        </div>

        <div>
          <label className="label" htmlFor="email">
            {t('form.email')}
          </label>
          <input id="email" name="email" type="email" className="input" />
        </div>

        <div>
          <label className="label" htmlFor="address">
            {t('form.address')}
          </label>
          <input id="address" name="address" className="input" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="btn-primary">
            {t('createBusiness')}
          </button>
          <Link href="/admin" className="btn-secondary inline-flex items-center">
            {t('cancel')}
          </Link>
        </div>
      </form>
    </main>
  )
}
