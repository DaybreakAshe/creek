'use client'

import { useState } from 'react'
import type { UIMessage } from '@/lib/chat/types'
import { useTranslations } from 'next-intl'
import { Check, Copy, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChatMarkdown } from '@/components/chat/ChatMarkdown'
import { ChatAssistantAvatar } from '@/components/chat/ChatAssistantAvatar'
import { ChatThinkingLabel } from '@/components/chat/ChatThinkingLabel'
import {
  getMessageReasoning,
  getMessageText,
  hasUnsupportedParts,
} from '@/lib/chat/message-utils'
import { useCurrentUser } from '@/hooks/use-current-user'

interface ChatMessageProps {
  message: UIMessage
  isStreaming?: boolean
  onRegenerate?: () => void
  canRegenerate?: boolean
}

export function ChatMessage({
  message,
  isStreaming,
  onRegenerate,
  canRegenerate,
}: ChatMessageProps) {
  const t = useTranslations('chat')
  const currentUser = useCurrentUser()
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const text = getMessageText(message)
  const reasoning = getMessageReasoning(message)
  const showThinking = !isUser && isStreaming && text.length === 0
  const showUnsupported = hasUnsupportedParts(message)

  const handleCopy = async () => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        'group flex gap-3 px-4 py-5',
        isUser ? 'bg-transparent' : 'bg-muted/30'
      )}
    >
      {isUser ? (
        <Avatar className="size-8 shrink-0">
          <AvatarImage
            src={currentUser?.avatar || undefined}
            alt={currentUser?.name || t('you')}
          />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {currentUser?.name?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      ) : (
        <ChatAssistantAvatar />
      )}

      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-muted-foreground text-xs font-medium">
          {isUser ? t('you') : t('assistant')}
        </p>

        {reasoning && !isStreaming && (
          <details className="text-muted-foreground group/reasoning text-xs">
            <summary className="cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="hover:text-foreground underline-offset-2 hover:underline">
                {t('reasoning')}
              </span>
            </summary>
            <p className="mt-2 leading-relaxed whitespace-pre-wrap">{reasoning}</p>
          </details>
        )}

        <div className="text-foreground">
          {showThinking ? (
            <ChatThinkingLabel />
          ) : isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
          ) : text ? (
            <ChatMarkdown content={text} />
          ) : null}
          {!isUser && isStreaming && text.length > 0 && (
            <span className="bg-foreground ml-0.5 inline-block h-4 w-0.5 animate-pulse align-middle" />
          )}
        </div>

        {!isUser && text && !isStreaming && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied ? t('copied') : t('copy')}
            </Button>
            {canRegenerate && onRegenerate && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
                onClick={onRegenerate}
              >
                <RotateCcw className="size-3.5" />
                {t('regenerate')}
              </Button>
            )}
          </div>
        )}

        {showUnsupported && (
          <p className="text-muted-foreground text-xs">{t('unsupportedPart')}</p>
        )}
      </div>
    </div>
  )
}
