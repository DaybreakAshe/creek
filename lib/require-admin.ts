import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import { getServerAuthSession } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

type RequireAdminResult =
  | { session: Session; error?: never }
  | { session?: never; error: NextResponse }

export async function requireAdmin(): Promise<RequireAdminResult> {
  const session = await getServerAuthSession()

  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: '未登录' }, { status: 401 }) }
  }

  if (!isAdmin(session.user.id)) {
    return { error: NextResponse.json({ error: '无权限' }, { status: 403 }) }
  }

  return { session }
}
