import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'

export default withAuth(
  function middleware(req) {
    const userId = req.nextauth.token?.id as string | undefined

    if (!isAdmin(userId)) {
      return NextResponse.redirect(new URL('/', req.url))
    }
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

export const config = {
  matcher: ['/admin/:path*'],
}
