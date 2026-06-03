'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { readCurrentUser } from '@/lib/chat/read-current-user'
import type { UserInfo } from '@/models/user'

/** 当前登录用户展示信息（优先 localStorage，与 Header 一致）。 */
export function useCurrentUser(): Pick<UserInfo, 'name' | 'avatar'> | null {
  const { data: session } = useSession()
  const [user, setUser] = useState<Pick<UserInfo, 'name' | 'avatar'> | null>(() =>
    readCurrentUser(session)
  )

  useEffect(() => {
    setUser(readCurrentUser(session))
  }, [session])

  return user
}
