import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { cookies } from 'next/headers'
import { getBusinessBySlug } from '@/lib/businesses'

type SlugLayoutProps = {
  children: React.ReactNode
  params: { slug: string }
}

export default async function SlugLayout({ children, params }: SlugLayoutProps) {
  const business = await getBusinessBySlug(params.slug)

  if (!business) {
    notFound()
  }

  const localeCookie = cookies().get('NEXT_LOCALE')?.value
  const locale =
    localeCookie === 'en' || localeCookie === 'fr' || localeCookie === 'ar'
      ? localeCookie
      : business.language

  const messages = (await import(`@/messages/${locale}.json`)).default

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div
        style={
          {
            '--business-primary': business.primary_color,
            '--business-secondary': business.secondary_color,
          } as React.CSSProperties
        }
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        {children}
      </div>
    </NextIntlClientProvider>
  )
}
