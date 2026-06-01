import createIntlMiddleware from 'next-intl/middleware'
import { withAuth } from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from '@/i18n/routing'
import { isAdmin } from '@/lib/admin'

const intlMiddleware = createIntlMiddleware(routing)

const authMiddleware = withAuth(
  function middleware(req) {
    const userId = req.nextauth.token?.id as string | undefined

    if (!isAdmin(userId)) {
      const locale =
        req.nextUrl.pathname.startsWith('/en/') ||
        req.nextUrl.pathname === '/en'
          ? 'en'
          : routing.defaultLocale
      const home = locale === routing.defaultLocale ? '/' : `/${locale}`
      return NextResponse.redirect(new URL(home, req.url))
    }

    return intlMiddleware(req)
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
)

function stripLocalePrefix(pathname: string) {
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return pathname.slice(3) || '/'
  }
  return pathname
}

export default function middleware(req: NextRequest) {
  const pathnameWithoutLocale = stripLocalePrefix(req.nextUrl.pathname)

  if (pathnameWithoutLocale.startsWith('/admin')) {
    return (authMiddleware as (req: NextRequest) => NextResponse)(req)
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
