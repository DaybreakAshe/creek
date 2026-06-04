'use client'

import { useTranslations } from 'next-intl'
import { ChatAssistantAvatar } from '@/components/chat/ChatAssistantAvatar'
import { ChatThinkingLabel } from '@/components/chat/ChatThinkingLabel'

export function ChatPendingReply() {
  const t = useTranslations('chat')

  return (
    <div className="flex justify-start px-4 py-3">
      <div className="flex max-w-[min(100%,40rem)] gap-2.5">
        <ChatAssistantAvatar />
        <div className="min-w-0 space-y-1.5">
          <p className="text-muted-foreground text-xs font-medium">{t('assistant')}</p>
          <div className="border-border/60 bg-muted/15 rounded-xl border px-3 py-2.5 shadow-sm">
            <ChatThinkingLabel />
          </div>
        </div>
      </div>
    </div>
  )
}
