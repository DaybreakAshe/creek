'use client'
import { loadUser } from '@/lib/localStorage'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/header/UserMenu'
import Link from 'next/link'

export const UserInfo = () => {
  const user = loadUser()
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
