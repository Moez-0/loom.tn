import SignupForm from './SignupForm'
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import LocaleSwitcher from '@/components/i18n/LocaleSwitcher'
import AuthMobileMenu from '@/components/auth/AuthMobileMenu'

type SignupPageProps = {
  searchParams: {
    next?: string
  }
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const t = await getTranslations('auth')
  const tLanding = await getTranslations('landing')
  const locale = (await getLocale()) as 'en' | 'fr' | 'ar'
  const nextPath = searchParams.next || '/auth/redirect'

  return (
    <main className="loom-landing grid-bg min-h-screen bg-[#0b0b0b] px-4 text-white sm:px-6">
      <nav className="nav-floating fixed z-50 border border-white/10 bg-[#0b0b0b]/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xl font-bold tracking-tighter">LOOM</Link>
            </div>
            <div className="hidden items-center space-x-8 text-sm font-medium text-[#888888] md:flex">
              <a className="transition hover:text-white" href="/#">{tLanding('nav.product')}</a>
              <a className="transition hover:text-white" href="/#pricing">{tLanding('nav.pricing')}</a>
            </div>
            <div className="hidden items-center gap-4 md:flex">
              <LocaleSwitcher currentLocale={locale} />
              <Link className="rounded-md px-4 py-2 text-sm font-medium text-white" href="/auth/login">
                {tLanding('nav.login')}
              </Link>
              <Link className="rounded-md bg-[#0067b0] px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600" href="/auth/signup">
                {tLanding('nav.startTrial')}
              </Link>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <LocaleSwitcher currentLocale={locale} />
              <AuthMobileMenu
                productLabel={tLanding('nav.product')}
                pricingLabel={tLanding('nav.pricing')}
                loginLabel={tLanding('nav.login')}
                startTrialLabel={tLanding('nav.startTrial')}
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto flex min-h-screen w-full max-w-[1200px] items-center justify-center py-20">
        <div className="w-full max-w-[390px] rounded-xl border border-white/10 bg-[#111111]/70 p-5 backdrop-blur-xl sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#888888]">{t('sectionLabel')}</p>
          <h1 className="mt-2.5 text-2xl font-bold tracking-tight text-white">{t('signupTitle')}</h1>
          <p className="mt-2 text-sm text-[#888888]">{t('signupSubtitle')}</p>

          <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0067b0]">{t('ownerFlowTitle')}</p>
            <p className="mt-2 text-xs leading-relaxed text-[#c8c8c8]">{t('ownerFlowText')}</p>
            <a
              className="mt-3 inline-flex text-xs font-semibold text-[#7ec8ff] hover:underline"
              href="mailto:contact@loom.tn?subject=Loom%20Business%20Linking%20Request"
            >
              {t('ownerFlowContact')}
            </a>
          </div>

          <SignupForm nextPath={nextPath} />
        </div>
      </div>
    </main>
  )
}
