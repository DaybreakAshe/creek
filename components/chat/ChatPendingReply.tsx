'use client'

import { useTranslations } from 'next-intl'
import { ChatAssistantAvatar } from '@/components/chat/ChatAssistantAvatar'
import { ChatThinkingLabel } from '@/components/chat/ChatThinkingLabel'

export function ChatPendingReply() {
  const t = useTranslations('chat')

  return (
    <div className="bg-muted/30 flex gap-3 px-4 py-5">
      <ChatAssistantAvatar />
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-muted-foreground text-xs font-medium">{t('assistant')}</p>
        <ChatThinkingLabel />
      </div>
    </div>
  )
}
