'use client'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { loadUser, saveUser, removeUser } from '@/lib/localStorage'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/header/UserAvatar'

import Link from 'next/link'

export const UserInfo = () => {
  const user = loadUser()
  console.log('user', user)
  return (
    <div>
      {user ? (
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
