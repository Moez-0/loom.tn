import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const locales = ['en', 'fr', 'ar'] as const

type Locale = (typeof locales)[number]

function pickLocale(): Locale {
  const cookieLocale = cookies().get('NEXT_LOCALE')?.value
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale
  }

  return 'fr'
}

export default getRequestConfig(async () => {
  const locale = pickLocale()

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
