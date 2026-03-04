import Link from 'next/link'
import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'
import LocaleSwitcher from '@/components/i18n/LocaleSwitcher'
import LandingMobileMenu from '@/components/landing/LandingMobileMenu'
import LandingIntroSplash from '@/components/landing/LandingIntroSplash'
import LandingFloatingWidgets from '@/components/landing/LandingFloatingWidgets'

const trustedBy = ['ATLAS GROUP', 'NABLI CLINIC', 'LA BRASSERIE', 'SENSE SALON', 'MÉDINA HOTEL', 'ARCHI STUDIO']

export default async function Home() {
  const locale = (await getLocale()) as 'en' | 'fr' | 'ar'
  const t = await getTranslations('landing')

  const faqItems = [
    { q: t('faq.items.domain.q'), a: t('faq.items.domain.a') },
    { q: t('faq.items.languages.q'), a: t('faq.items.languages.a') },
    { q: t('faq.items.payments.q'), a: t('faq.items.payments.a') },
  ]

  return (
    <main className="loom-landing bg-[#0b0b0b] text-white antialiased">
      <LandingIntroSplash />
      <nav className="nav-floating fixed z-50 border border-white/10 bg-[#0b0b0b]/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xl font-bold tracking-tighter">LOOM</Link>
            </div>
            <div className="hidden items-center space-x-8 text-sm font-medium text-[#888888] md:flex">
              <a className="transition hover:text-white" href="#product">{t('nav.product')}</a>
              <a className="transition hover:text-white" href="#solutions">{t('nav.solutions')}</a>
              <a className="transition hover:text-white" href="#pricing">{t('nav.pricing')}</a>
              <a className="transition hover:text-white" href="#resources">{t('nav.resources')}</a>
              <a className="transition hover:text-white" href="#contact">{t('nav.contact')}</a>
            </div>
            <div className="hidden items-center gap-4 md:flex">
              <LocaleSwitcher currentLocale={locale} variant="icon" />
              <Link className="rounded-md px-4 py-2 text-sm font-medium text-white" href="/auth/login">
                {t('nav.login')}
              </Link>
              <Link className="rounded-md bg-[#0067b0] px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600" href="/auth/signup">
                {t('nav.startTrial')}
              </Link>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <LocaleSwitcher currentLocale={locale} variant="icon" />
              <LandingMobileMenu
                productLabel={t('nav.product')}
                solutionsLabel={t('nav.solutions')}
                pricingLabel={t('nav.pricing')}
                resourcesLabel={t('nav.resources')}
                contactLabel={t('nav.contact')}
                loginLabel={t('nav.login')}
                startTrialLabel={t('nav.startTrial')}
              />
            </div>
          </div>
        </div>
      </nav>

      <section className="grid-bg relative overflow-hidden pb-24 pt-40">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-left">
              <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl">
                {t('hero.titlePrefix')} <span className="text-[#0067b0]">{t('hero.titleAccent')}</span>
              </h1>
              <p className="mb-10 max-w-xl text-lg text-[#888888]">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link className="rounded-md bg-[#0067b0] px-8 py-4 font-bold text-white shadow-lg shadow-[#0067b0]/20 transition hover:bg-opacity-90" href="/auth/signup">
                  {t('hero.startTrial')}
                </Link>
                <a className="rounded-md border border-[#1e1e1e] bg-[#111111] px-8 py-4 font-bold text-white transition hover:bg-zinc-800" href="#contact">
                  {t('hero.contactTeam')}
                </a>
              </div>
              <div className="mt-6 max-w-2xl rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#0067b0]">{t('hero.flowTitle')}</p>
                <p className="mt-2 text-sm text-[#c8c8c8]">{t('hero.flowText')}</p>
              </div>
            </div>
            <div className="relative">
              <div>
                <Image
                  alt={t('hero.imageAlt')}
                  className="h-auto w-full rounded-xl border border-white/10 shadow-2xl transition-transform duration-500 hover:scale-105"
                  src="/dashboard_preview.png"
                  width={1600}
                  height={900}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  style={{ transform: 'perspective(1000px) rotateY(-15deg) rotateX(5deg)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#1e1e1e] bg-[#0b0b0b] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <p className="mb-10 text-center text-xs font-semibold uppercase tracking-widest text-[#888888] italic">{t('trusted.title')}</p>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-60 md:gap-20">
            {trustedBy.map((item) => (
              <span key={item} className="text-xl font-bold tracking-tighter">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0b0b0b] py-16" id="product">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">{t('dashboardPreview.title')}</h2>
            <p className="mx-auto max-w-xl text-[#888888]">
              {t('dashboardPreview.subtitle')}
            </p>
          </div>

          <div className="glass-card overflow-hidden rounded-xl border border-white/5 shadow-2xl">
            <Image
              alt={t('hero.imageAlt')}
              className="h-auto w-full"
              src="/dashboard_preview.png"
              width={1600}
              height={900}
              sizes="100vw"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#0b0b0b] py-16" id="solutions">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              {
                title: t('pillars.website.title'),
                text: t('pillars.website.text'),
                path: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
              },
              {
                title: t('pillars.operations.title'),
                text: t('pillars.operations.text'),
                path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
              },
              {
                title: t('pillars.automations.title'),
                text: t('pillars.automations.text'),
                path: 'M13 10V3L4 14h7v7l9-11h-7z',
              },
            ].map((item) => (
              <div key={item.title} className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center bg-[#0067b0]/10 text-[#0067b0]">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d={item.path} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="leading-relaxed text-[#888888]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#0b0b0b] py-16" id="workflow">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-16">
            <div className="flex flex-col items-center gap-12 md:flex-row">
              <div className="flex-1">
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#0067b0]">{t('workflow.step1.label')}</span>
                <h2 className="mb-4 text-3xl font-bold">{t('workflow.step1.title')}</h2>
                <p className="mb-6 text-[#888888]">
                  {t('workflow.step1.text')}
                </p>
                <button className="rounded-md bg-[#0067b0] px-6 py-2 text-sm font-bold text-white">{t('workflow.learnMore')}</button>
              </div>
              <div className="glass-card w-full max-w-xl rounded-xl border border-white/5 p-4 shadow-2xl">
                <div className="overflow-hidden rounded-lg border border-white/10">
                  <Image
                    alt={t('workflow.step1.title')}
                    className="h-[260px] w-full object-cover object-top"
                    src="/dashboard_website_preview.png"
                    width={1600}
                    height={900}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-white/90">
                  <span className="rounded-full border border-[#0067b0]/60 bg-[#0067b0]/20 px-3 py-1">{t('workflow.badges.liveDashboard')}</span>
                  <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1">{t('workflow.badges.reservations')}</span>
                  <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1">{t('workflow.badges.analytics')}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-12 md:flex-row-reverse">
              <div className="flex-1">
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#0067b0]">{t('workflow.step2.label')}</span>
                <h2 className="mb-4 text-3xl font-bold">{t('workflow.step2.title')}</h2>
                <p className="mb-6 text-[#888888]">
                  {t('workflow.step2.text')}
                </p>
                <button className="rounded-md bg-[#0067b0] px-6 py-2 text-sm font-bold text-white">{t('workflow.learnMore')}</button>
              </div>
              <div className="glass-card w-full max-w-xl rounded-xl border border-white/5 p-4 shadow-2xl">
                <div className="overflow-hidden rounded-lg border border-white/10">
                  <Image
                    alt={t('workflow.goLive.title')}
                    className="h-[260px] w-full object-cover object-top"
                    src="/dashboard_reservations_preview.png"
                    width={1600}
                    height={900}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="h-2 rounded bg-[#0067b0]/70" />
                  <div className="h-2 rounded bg-[#0067b0]/40" />
                  <div className="h-2 rounded bg-[#0067b0]/25" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#1e1e1e] bg-[#0b0b0b] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {['+42%', '-31%', '3 min', '99.9%'].map((value) => (
              <div key={value} className="text-center">
                <p className="mb-2 text-4xl font-bold text-[#0067b0]">{value}</p>
                <p className="text-sm font-medium text-[#888888]">
                  {t('metrics.description')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0b0b0b] py-16" id="pricing">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">{t('pricing.title')}</h2>
            <p className="text-[#888888]">
              {t('pricing.subtitle')}
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-8 lg:flex-row">
            <div className="glass-card rounded-xl border border-white/5 p-8 shadow-2xl">
              <h3 className="mb-4 text-2xl font-bold">{t('pricing.professional.title')}</h3>
              <p className="mb-8 text-[#888888]">
                {t('pricing.professional.text')}
              </p>
              <ul className="mb-8 space-y-4">
                {[
                  t('pricing.professional.features.unlimited'),
                  t('pricing.professional.features.domain'),
                  t('pricing.professional.features.analytics'),
                  t('pricing.professional.features.support'),
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-[#0067b0]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-[#0067b0] p-1 lg:w-1/3">
              <div className="flex h-full w-full flex-col items-center justify-center rounded-[14px] bg-[#0b0b0b] p-10 text-center">
                <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[#0067b0]">{t('pricing.monthlyLabel')}</p>
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-6xl font-black">49</span>
                  <span className="text-xl font-bold text-[#888888]">{t('pricing.perSub')}</span>
                </div>
                <p className="mb-10 text-sm text-[#888888]">
                  {t('pricing.cardText')}
                </p>
                <Link className="w-full rounded-md bg-[#0067b0] py-4 font-bold text-white shadow-lg shadow-[#0067b0]/20 transition hover:bg-blue-600" href="/auth/signup">
                  {t('pricing.getStartedNow')}
                </Link>
                <p className="mt-3 text-xs text-[#888888]">{t('pricing.activationNote')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#1e1e1e] bg-[#0b0b0b] py-16" id="resources">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">{t('faq.title')}</h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <details key={item.q} className="overflow-hidden border border-[#1e1e1e]" open={index === 0}>
                <summary className="rounded-md bg-[#111111] px-6 py-4 text-left font-semibold transition hover:bg-zinc-800">
                  {item.q}
                </summary>
                <div className="bg-[#0b0b0b] px-6 py-4 text-sm text-[#888888]">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#1e1e1e] bg-[#0b0b0b] py-16" id="contact">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="glass-card relative rounded-xl border border-white/5 p-8 shadow-2xl">
            <div className="relative z-10">
              <h2 className="mb-6 text-4xl font-bold md:text-5xl">{t('cta.title')}</h2>
              <p className="mx-auto mb-10 max-w-xl text-[#888888]">
                {t('cta.text')}
              </p>
              <p className="mx-auto mb-6 max-w-2xl text-sm text-[#c8c8c8]">{t('cta.processNote')}</p>
              <div className="mx-auto mb-8 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
                <a className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 transition hover:bg-white/10" href="mailto:contact@loom.tn">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#0067b0]">{t('contactBlocks.emailLabel')}</p>
                  <p className="mt-1 text-sm font-medium text-white">contact@loom.tn</p>
                </a>
                <a className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 transition hover:bg-white/10" href="tel:+21671000000">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#0067b0]">{t('contactBlocks.phoneLabel')}</p>
                  <p className="mt-1 text-sm font-medium text-white">+216 71 000 000</p>
                </a>
                <a className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 transition hover:bg-white/10" href="https://wa.me/21671000000" target="_blank" rel="noreferrer">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#0067b0]">{t('contactBlocks.whatsappLabel')}</p>
                  <p className="mt-1 text-sm font-medium text-white">WhatsApp</p>
                </a>
              </div>
              <a className="inline-flex rounded-md bg-[#0067b0] px-10 py-4 font-bold text-white shadow-lg shadow-[#0067b0]/20 transition hover:bg-blue-600" href="mailto:contact@loom.tn?subject=Loom%20Full%20Usage%20Request">
                {t('cta.button')}
              </a>
            </div>
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#0067b0]/5 blur-[100px]" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#0067b0]/5 blur-[100px]" />
          </div>
        </div>
      </section>

      <footer className="border-t border-[#1e1e1e] bg-[#0b0b0b] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tighter">LOOM</span>
              </div>
              <p className="text-sm text-[#888888]">
                {t('footer.description')}
              </p>
          
            </div>

            <div>
              <h4 className="mb-6 font-bold">{t('footer.contact.title')}</h4>
              <ul className="space-y-4 text-sm text-[#888888]">
                <li>{t('footer.contact.email')}: contact@loom.tn</li>
                <li>{t('footer.contact.phone')}: +216 71 000 000</li>
                <li>{t('footer.contact.location')}: Tunis, Tunisia</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#1e1e1e] pt-10 text-center">
            <p className="text-xs text-[#888888]">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
      <LandingFloatingWidgets />
    </main>
  )
}
