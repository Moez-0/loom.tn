import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getLocale } from 'next-intl/server'
import LocaleSwitcher from '@/components/i18n/LocaleSwitcher'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/auth/LogoutButton'
import { ensureUserProfile } from '@/lib/auth/profile'
import AdminSidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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

  const t = await getTranslations('admin')
  const locale = (await getLocale()) as 'en' | 'fr' | 'ar'
  const links = [
    { href: '/admin', label: t('businesses') },
    { href: '/admin/analytics', label: t('analytics') },
    { href: '/admin/calendar', label: t('calendar') },
    { href: '/admin/users', label: t('users') },
  ]

  return (
    <div className="min-h-screen bg-loom-off-white text-loom-black">
      <AdminSidebar sectionLabel={t('admin')} links={links} />

      <div className="min-h-screen bg-loom-off-white lg:ml-[256px]">
        <header className="border-b border-loom-border bg-loom-surface">
          <div className="flex min-h-14 items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
            <p className="text-base font-bold tracking-tight text-loom-black lg:hidden">LOOM</p>
            <p className="section-label">{t('admin')}</p>
            <div className="flex items-center gap-3">
              <Link className="btn-primary !px-4 !py-2 !text-xs" href="/admin/businesses/new">
                {t('addBusiness')}
              </Link>
              <LocaleSwitcher currentLocale={locale} />
              <LogoutButton label={t('logout')} />
            </div>
          </div>
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
