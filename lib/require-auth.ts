import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import { getServerAuthSession } from '@/lib/auth'
import { apiError } from '@/lib/api-response'

type RequireAuthResult =
  | { session: Session; error?: never }
  | { session?: never; error: NextResponse }

export async function requireAuth(): Promise<RequireAuthResult> {
  const session = await getServerAuthSession()

  if (!session?.user?.id) {
    return { error: apiError('unauthorized', 401) }
  }

  return { session }
}
