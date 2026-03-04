import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'

type BusinessRow = {
  id: string
  name: string
  slug: string
  custom_domain: string | null
  type: string
  language: string
  is_active: boolean
  trial_ends_at: string
  subscription_status: 'trialing' | 'active' | 'past_due' | 'cancelled'
  created_at: string
}

export default async function AdminPage() {
  const t = await getTranslations('admin')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/admin')
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

  const { data, error } = await admin
    .from('businesses')
    .select('id, name, slug, custom_domain, type, language, is_active, trial_ends_at, subscription_status, created_at')
    .order('created_at', { ascending: false })

  const businesses = (data ?? []) as BusinessRow[]

  return (
    <main>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">{t('clients')}</p>
          <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">
            {t('businesses')}
          </h1>
        </div>
        <Link href="/admin/businesses/new" className="btn-primary inline-flex items-center">
          {t('addBusiness')}
        </Link>
      </div>

      {error ? (
        <p className="border border-loom-error bg-loom-white p-4 text-sm text-loom-error">
          {t('loadError')}: {error.message}
        </p>
      ) : (
        <div className="overflow-x-auto border border-loom-border bg-loom-white">
          <table className="w-full border-collapse text-left text-[0.938rem]">
            <thead>
              <tr className="border-b border-loom-border bg-loom-surface">
                <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('table.name')}</th>
                <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('table.slug')}</th>
                <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('table.website')}</th>
                <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('table.type')}</th>
                <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('table.lang')}</th>
                <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('table.status')}</th>
                <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('table.subscription')}</th>
                <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('table.created')}</th>
              </tr>
            </thead>
            <tbody>
              {businesses.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-loom-muted" colSpan={8}>
                    {t('empty')}
                  </td>
                </tr>
              ) : (
                businesses.map((business) => (
                  <tr key={business.id} className="border-b border-loom-border last:border-b-0">
                    <td className="px-4 py-3 text-loom-black">
                      <Link href={`/admin/businesses/${business.id}`} className="border-b border-loom-border-dark">
                        {business.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-loom-black">{business.slug}</td>
                    <td className="px-4 py-3">
                      {business.is_active ? (
                        <Link
                          href={business.custom_domain ? `https://${business.custom_domain}` : `/${business.slug}`}
                          className="border-b border-loom-border-dark text-sm text-loom-black"
                          target="_blank"
                        >
                          {t('viewSite')}
                        </Link>
                      ) : (
                        <span className="text-sm text-loom-muted">{t('unpublished')}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize text-loom-muted">{business.type}</td>
                    <td className="px-4 py-3 uppercase text-loom-muted">{business.language}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${business.is_active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                        {business.is_active ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-loom-muted">
                      {business.subscription_status === 'trialing'
                        ? `${t('trial')} · ${new Date(business.trial_ends_at).toLocaleDateString()}`
                        : t(`subscription.${business.subscription_status}`)}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-loom-muted">
                      {new Date(business.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
