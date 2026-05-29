'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { LogOut, Shield, User } from 'lucide-react'
import { UserInfo } from '@/models/user'
import { removeUser } from '@/lib/localStorage'
import { UserAvatar } from '@/components/header/UserAvatar'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface UserMenuProps {
  user: UserInfo
}

export const UserMenu = ({ user }: UserMenuProps) => {
  const t = useTranslations('auth')
  const { data: session } = useSession()
  const [signingOut, setSigningOut] = useState(false)
  const isAdmin = session?.user?.isAdmin ?? false

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      removeUser()
      await signOut({ callbackUrl: '/login' })
    } catch (error) {
      console.error('Sign out error:', error)
      setSigningOut(false)
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('openUserMenu')}
          className={cn(
            'size-8 cursor-pointer rounded-full p-0',
            'hover:ring-border hover:ring-2 hover:ring-offset-2 hover:ring-offset-background',
            'focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          )}
        >
          <UserAvatar user={user} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="z-[100] w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="truncate text-sm leading-none font-medium">{user.name}</p>
            <p className="text-muted-foreground truncate text-xs">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User />
              {t('profile')}
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <Shield />
                {t('admin')}
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            disabled={signingOut}
            onSelect={(event) => {
              event.preventDefault()
              handleSignOut()
            }}
          >
            <LogOut />
            {signingOut ? t('signingOut') : t('signOut')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
