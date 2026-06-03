'use client'

import { useTranslations } from 'next-intl'
import { Bot } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChatTypingIndicator } from '@/components/chat/ChatTypingIndicator'

export function ChatPendingReply() {
  const t = useTranslations('chat')

  return (
    <div className="bg-muted/30 flex gap-3 px-4 py-5">
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="bg-secondary text-xs">
          <Bot className="size-4" />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-muted-foreground text-xs font-medium">{t('assistant')}</p>
        <div className="text-foreground flex items-center gap-2 text-sm">
          <ChatTypingIndicator />
          <span className="text-muted-foreground">{t('thinking')}</span>
        </div>
      </div>
    </div>
  )
}
