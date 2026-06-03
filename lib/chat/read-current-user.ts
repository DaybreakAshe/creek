import { loadUser } from '@/lib/localStorage'
import type { UserInfo } from '@/models/user'

export function readCurrentUser(
  session: { user?: { name?: string | null; image?: string | null } } | null | undefined
): Pick<UserInfo, 'name' | 'avatar'> | null {
  if (typeof window !== 'undefined') {
    const stored = loadUser()
    if (stored?.email) {
      return { name: stored.name, avatar: stored.avatar }
    }
  }

  if (session?.user) {
    return {
      name: session.user.name ?? '',
      avatar: session.user.image ?? '',
    }
  }

  return null
}
