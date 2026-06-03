'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { loadUser } from '@/lib/localStorage'
import type { UserInfo } from '@/models/user'

function fromSession(
  session: NonNullable<ReturnType<typeof useSession>['data']>
): Pick<UserInfo, 'name' | 'avatar'> {
  return {
    name: session.user?.name ?? '',
    avatar: session.user?.image ?? '',
  }
}

/** 当前登录用户展示信息（优先 localStorage，与 Header 一致）。 */
export function useCurrentUser(): Pick<UserInfo, 'name' | 'avatar'> | null {
  const { data: session } = useSession()
  const [user, setUser] = useState<Pick<UserInfo, 'name' | 'avatar'> | null>(
    null
  )

  useEffect(() => {
    const stored = loadUser()
    if (stored?.email) {
      setUser({ name: stored.name, avatar: stored.avatar })
      return
    }

    if (session?.user) {
      setUser(fromSession(session))
      return
    }

    setUser(null)
  }, [session])

  return user
}
