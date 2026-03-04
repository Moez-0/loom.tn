import { getTranslations } from 'next-intl/server'
import { getLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import LogoutButton from '@/components/auth/LogoutButton'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import LocaleSwitcher from '@/components/i18n/LocaleSwitcher'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTrialDaysRemaining } from '@/lib/billing/trial'

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/dashboard')
  }

  const profile = await ensureUserProfile(user)

  if (profile?.role === 'superadmin') {
    redirect('/admin')
  }

  const t = await getTranslations('dashboard')
  const locale = (await getLocale()) as 'en' | 'fr' | 'ar'
  const links = [
    { href: '/dashboard', label: t('overview') },
    { href: '/dashboard/analytics', label: t('analytics') },
    { href: '/dashboard/calendar', label: t('calendar') },
    { href: '/dashboard/reservations', label: t('reservations') },
    { href: '/dashboard/website', label: 'Website' },
    { href: '/dashboard/staff', label: t('staff') },
    { href: '/dashboard/services', label: t('services') },
    { href: '/dashboard/settings', label: t('settings') },
    { href: '/dashboard/billing', label: t('billing') },
  ]

  let trialBadgeText: string | null = null

  if (profile?.business_id) {
    const admin = createAdminClient()
    if (admin) {
      const { data: business } = await admin
        .from('businesses')
        .select('trial_ends_at, subscription_status')
        .eq('id', profile.business_id)
        .maybeSingle<{ trial_ends_at: string; subscription_status: 'trialing' | 'active' | 'past_due' | 'cancelled' }>()

      if (business?.subscription_status === 'trialing') {
        const daysRemaining = getTrialDaysRemaining(business.trial_ends_at)

        if (daysRemaining <= 0) {
          trialBadgeText = t('trialEndsTodayBadge')
        } else {
          trialBadgeText = t('trialDaysLeftBadge', { days: daysRemaining })
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-loom-off-white text-loom-black">
      <Sidebar sectionLabel={t('dashboard')} links={links} />

      <div className="min-h-screen bg-loom-off-white lg:ml-[256px]">
        <header className="border-b border-loom-border bg-loom-surface">
          <div className="flex min-h-14 items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
            <p className="text-base font-bold tracking-tight text-loom-black lg:hidden">LOOM</p>
            <p className="section-label">{t('businessDashboard')}</p>
            <div className="flex items-center gap-3">
              {trialBadgeText ? (
                <span className="badge hidden text-loom-accent sm:inline-flex" title={t('freeTrialBadge')}>
                  {t('freeTrialBadge')} · {trialBadgeText}
                </span>
              ) : null}
              <LocaleSwitcher currentLocale={locale} />
              <LogoutButton label={t('logout')} />
            </div>
          </div>
          {trialBadgeText ? (
            <div className="border-t border-loom-border px-4 py-2 sm:hidden">
              <span className="badge text-loom-accent" title={t('freeTrialBadge')}>
                {t('freeTrialBadge')} · {trialBadgeText}
              </span>
            </div>
          ) : null}
          <div className="border-t border-loom-border px-4 py-2 lg:hidden">
            <nav className="flex gap-2 overflow-x-auto pb-1">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap rounded-md border border-loom-border bg-loom-off-white px-3 py-1.5 text-xs font-medium text-loom-muted"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
