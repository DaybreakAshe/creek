'use client'

import { useState } from 'react'
import type { UIMessage } from '@/lib/chat/types'
import { useTranslations } from 'next-intl'
import { Bot, Check, Copy, RotateCcw, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChatMarkdown } from '@/components/chat/ChatMarkdown'
import { getMessageText } from '@/lib/chat/message-utils'

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
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const text = getMessageText(message)
  const showTypingCursor =
    !isUser && isStreaming && text.length === 0

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
      <Avatar className="size-8 shrink-0">
        <AvatarFallback
          className={cn(
            'text-xs',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'
          )}
        >
          {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-muted-foreground text-xs font-medium">
          {isUser ? t('you') : t('assistant')}
        </p>

        <div className="text-foreground">
          {showTypingCursor ? (
            <span className="inline-flex items-center gap-1">
              <span className="bg-foreground/70 size-2 animate-pulse rounded-full" />
              <span className="bg-foreground/50 size-2 animate-pulse rounded-full [animation-delay:150ms]" />
              <span className="bg-foreground/30 size-2 animate-pulse rounded-full [animation-delay:300ms]" />
            </span>
          ) : isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
          ) : (
            <ChatMarkdown content={text} />
          )}
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

        {message.parts.some((p) => p.type !== 'text') && (
          <p className="text-muted-foreground text-xs">{t('unsupportedPart')}</p>
        )}
      </div>
    </div>
  )
}
