'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CHAT_ASSISTANT_AVATAR_URL } from '@/lib/chat/constants'

interface ChatAssistantAvatarProps {
  className?: string
}

export function ChatAssistantAvatar({ className }: ChatAssistantAvatarProps) {
  const t = useTranslations('chat')

  return (
    <Avatar className={cn('size-8 shrink-0', className)}>
      <AvatarImage src={CHAT_ASSISTANT_AVATAR_URL} alt={t('assistant')} />
      <AvatarFallback className="bg-secondary text-xs">AI</AvatarFallback>
    </Avatar>
  )
}
