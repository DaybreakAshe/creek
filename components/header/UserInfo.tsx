'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { loadUser, saveUser } from '@/lib/localStorage'
import { UserInfo as UserInfoType } from '@/models/user'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/header/UserMenu'
import Link from 'next/link'

function toUserInfo(session: NonNullable<ReturnType<typeof useSession>['data']>): UserInfoType {
  return {
    id: session.user?.id ?? session.user?.email ?? '',
    name: session.user?.name ?? '',
    email: session.user?.email ?? '',
    access_token: session.accessToken ?? '',
    avatar: session.user?.image ?? '',
  }
}

export const UserInfo = () => {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<UserInfoType | null>(null)

  useEffect(() => {
    const stored = loadUser()
    if (stored?.email) {
      setUser(stored)
      return
    }

    if (session?.user?.email) {
      const sessionUser = toUserInfo(session)
      saveUser(sessionUser)
      setUser(sessionUser)
      return
    }

    if (status === 'unauthenticated') {
      setUser(null)
    }
  }, [session, status])

  if (status === 'loading' && !user) {
    return <div className="size-8 shrink-0" aria-hidden />
  }

  return (
    <div>
      {user?.email ? (
        <UserMenu user={user} />
      ) : (
        <Link href="/login">
          <Button variant="outline">Login</Button>
        </Link>
      )}
    </div>
  )
}
