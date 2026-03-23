'use client'
import { loadUser } from '@/lib/localStorage'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/header/UserAvatar'
import Link from 'next/link'

export const UserInfo = () => {
  const user = loadUser()
  return (
    <div>
      {user?.email ? (
        <div>
          <UserAvatar user={user} />
        </div>
      ) : (
        <Link href="/login">
          <Button variant="outline">Login</Button>
        </Link>
      )}
    </div>
  )
}
