import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isProtected = path === '/dashboard' || path.startsWith('/dashboard/') || path === '/admin' || path.startsWith('/admin/')

  if (isProtected && !user) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  const hostHeader = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? ''
  const host = hostHeader.split(':')[0].trim().toLowerCase()
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN?.trim().toLowerCase()
  const isMainHost =
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host === '127.0.0.1' ||
    (Boolean(appDomain) && (host === appDomain || host === `www.${appDomain}`))

  const isPublicSitePath =
    !path.startsWith('/api') &&
    !path.startsWith('/_next') &&
    !path.startsWith('/auth') &&
    !path.startsWith('/dashboard') &&
    !path.startsWith('/admin') &&
    !path.includes('.')

  if (!isMainHost && isPublicSitePath && host) {
    const { data: businessByDomain } = await supabase
      .from('businesses')
      .select('slug')
      .eq('custom_domain', host)
      .eq('is_active', true)
      .maybeSingle<{ slug: string }>()

    if (businessByDomain?.slug) {
      const slugPrefix = `/${businessByDomain.slug}`
      if (path === slugPrefix || path.startsWith(`${slugPrefix}/`)) {
        return response
      }

      const rewriteUrl = request.nextUrl.clone()
      rewriteUrl.pathname = path === '/' ? slugPrefix : `${slugPrefix}${path}`
      return NextResponse.rewrite(rewriteUrl)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
