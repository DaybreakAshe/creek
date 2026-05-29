import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import { getServerAuthSession } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { apiError } from '@/lib/api-response'

type RequireAdminResult =
  | { session: Session; error?: never }
  | { session?: never; error: NextResponse }

export async function requireAdmin(): Promise<RequireAdminResult> {
  const session = await getServerAuthSession()

  if (!session?.user?.id) {
    return { error: apiError('unauthorized', 401) }
  }

  if (!isAdmin(session.user.id)) {
    return { error: apiError('forbidden', 403) }
  }

  return { session }
}
