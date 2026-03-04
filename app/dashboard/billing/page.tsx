import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOwnerSubscriptionLabel, getTrialDaysRemaining } from '@/lib/billing/trial'

type BillingBusiness = {
  id: string
  name: string
  trial_started_at: string
  trial_ends_at: string
  subscription_status: 'trialing' | 'active' | 'past_due' | 'cancelled'
}

export default async function DashboardBillingPage() {
  const t = await getTranslations('dashboard')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/dashboard/billing')
  }

  const profile = await ensureUserProfile(user)

  if (!profile?.business_id) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('billing')}</h1>
        <p className="mt-4 border border-loom-border bg-loom-white p-4 text-sm text-loom-muted">{t('noBusiness')}</p>
      </main>
    )
  }

  const admin = createAdminClient()

  if (!admin) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('billing')}</h1>
        <p className="mt-4 border border-loom-error bg-loom-white p-4 text-sm text-loom-error">
          Missing SUPABASE_SERVICE_ROLE_KEY
        </p>
      </main>
    )
  }

  const { data } = await admin
    .from('businesses')
    .select('id, name, trial_started_at, trial_ends_at, subscription_status')
    .eq('id', profile.business_id)
    .single<BillingBusiness>()

  if (!data) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('billing')}</h1>
        <p className="mt-4 border border-loom-error bg-loom-white p-4 text-sm text-loom-error">{t('billingLoadError')}</p>
      </main>
    )
  }

  const statusLabel = getOwnerSubscriptionLabel(data.subscription_status, data.trial_ends_at)
  const trialDays = getTrialDaysRemaining(data.trial_ends_at)

  return (
    <main>
      <p className="section-label">{t('dashboard')}</p>
      <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('billing')}</h1>

      <section className="mt-6 border border-loom-border bg-loom-white p-6">
        <p className="section-label">{t('planStatus')}</p>
        <h2 className="mt-3 text-2xl tracking-[-0.02em] text-loom-black">{statusLabel}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="border border-loom-border p-4">
            <p className="section-label">{t('trialStarted')}</p>
            <p className="mt-2 font-mono text-sm text-loom-black">{new Date(data.trial_started_at).toLocaleDateString()}</p>
          </div>
          <div className="border border-loom-border p-4">
            <p className="section-label">{t('trialEnds')}</p>
            <p className="mt-2 font-mono text-sm text-loom-black">{new Date(data.trial_ends_at).toLocaleDateString()}</p>
          </div>
          <div className="border border-loom-border p-4">
            <p className="section-label">{t('daysLeft')}</p>
            <p className="mt-2 font-mono text-sm text-loom-black">{trialDays > 0 ? trialDays : 0}</p>
          </div>
        </div>

        <p className="mt-6 border border-loom-border bg-loom-off-white p-4 text-sm text-loom-muted">
          {t('fullUseNotice')}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href="mailto:hello@loom.tn?subject=Loom%20Contract%20Request" className="btn-primary inline-flex items-center">
            {t('requestContract')}
          </a>
          <a href="mailto:hello@loom.tn?subject=Loom%20Payment%20Question" className="btn-secondary inline-flex items-center">
            {t('contactSupport')}
          </a>
        </div>
      </section>
    </main>
  )
}
