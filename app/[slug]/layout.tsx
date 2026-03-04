import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { cookies } from 'next/headers'
import { getBusinessBySlug } from '@/lib/businesses'

type SlugLayoutProps = {
  children: React.ReactNode
  params: { slug: string }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const business = await getBusinessBySlug(params.slug)

  if (!business) {
    return {
      title: 'Loom',
      icons: {
        icon: '/favicon.svg',
      },
    }
  }

  const iconUrl = business.logo_url || business.cover_image_url || '/favicon.svg'
  const description = business.description?.trim() || `Book services with ${business.name}.`

  return {
    title: {
      default: business.name,
      template: `%s · ${business.name}`,
    },
    description,
    icons: {
      icon: [{ url: iconUrl }],
      shortcut: [iconUrl],
      apple: [{ url: iconUrl }],
    },
    openGraph: {
      title: business.name,
      description,
      images: business.cover_image_url ? [{ url: business.cover_image_url }] : undefined,
    },
  }
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
