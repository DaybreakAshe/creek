'use client'

import { memo } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { CHAT_ASSISTANT_AVATAR_URL } from '@/lib/chat/constants'

interface ChatAssistantAvatarProps {
  className?: string
}

/** 用 background-image 展示，避免 Radix Avatar 每次 remount 时先闪 fallback。 */
export const ChatAssistantAvatar = memo(function ChatAssistantAvatar({
  className,
}: ChatAssistantAvatarProps) {
  const t = useTranslations('chat')

  return (
    <div
      role="img"
      aria-label={t('assistant')}
      className={cn(
        'size-8 shrink-0 rounded-full bg-cover bg-center bg-no-repeat',
        className
      )}
      style={{ backgroundImage: `url(${CHAT_ASSISTANT_AVATAR_URL})` }}
    />
  )
})
