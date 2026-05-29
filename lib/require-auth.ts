import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import { getServerAuthSession } from '@/lib/auth'

type RequireAuthResult =
  | { session: Session; error?: never }
  | { session?: never; error: NextResponse }

export async function requireAuth(): Promise<RequireAuthResult> {
  const session = await getServerAuthSession()

  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: '未登录' }, { status: 401 }) }
  }

  return { session }
}
