'use client'

import { memo } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { useCurrentUser } from '@/hooks/use-current-user'

interface ChatUserAvatarProps {
  className?: string
}

export const ChatUserAvatar = memo(function ChatUserAvatar({
  className,
}: ChatUserAvatarProps) {
  const t = useTranslations('chat')
  const user = useCurrentUser()
  const label = user?.name || t('you')
  const initial = user?.name?.[0]?.toUpperCase() || 'U'

  if (user?.avatar) {
    return (
      <div
        role="img"
        aria-label={label}
        className={cn(
          'size-8 shrink-0 rounded-full bg-cover bg-center bg-no-repeat',
          className
        )}
        style={{ backgroundImage: `url(${user.avatar})` }}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        'bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs',
        className
      )}
    >
      {initial}
    </div>
  )
})
