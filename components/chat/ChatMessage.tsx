'use client'

import { useState } from 'react'
import type { UIMessage } from '@/lib/chat/types'
import { useTranslations } from 'next-intl'
import { Check, Copy, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AssistantMessageContent } from '@/components/chat/AssistantMessageContent'
import { ChatAssistantAvatar } from '@/components/chat/ChatAssistantAvatar'
import { ChatUserAvatar } from '@/components/chat/ChatUserAvatar'
import { ChatThinkingLabel } from '@/components/chat/ChatThinkingLabel'
import {
  getMessageReasoning,
  getMessageText,
  hasUnsupportedParts,
} from '@/lib/chat/message-utils'

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
  const reasoning = getMessageReasoning(message)
  const showThinking = !isUser && isStreaming && text.length === 0
  const showUnsupported = hasUnsupportedParts(message)
  const showActions = !isUser && text.length > 0

  const handleCopy = async () => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const bubbleClass = cn(
    'border-border/60 bg-background rounded-xl border px-3 py-2.5',
    isUser ? 'bg-muted/30' : 'bg-muted/15'
  )

  return (
    <div
      className={cn(
        'flex px-4 py-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'flex max-w-[min(100%,40rem)] gap-2.5',
          isUser && 'flex-row-reverse'
        )}
      >
        {isUser ? <ChatUserAvatar /> : <ChatAssistantAvatar />}

        <div className="min-w-0 space-y-1.5">
          <p
            className={cn(
              'text-muted-foreground pointer-events-none text-xs font-medium select-none',
              isUser && 'text-right'
            )}
          >
            {isUser ? t('you') : t('assistant')}
          </p>

          <div className={bubbleClass}>
            {reasoning && !isStreaming && (
              <details className="text-muted-foreground mb-2 text-xs">
                <summary className="cursor-pointer list-none marker:content-none select-none [&::-webkit-details-marker]:hidden">
                  <span className="hover:text-foreground underline-offset-2 hover:underline">
                    {t('reasoning')}
                  </span>
                </summary>
                <p className="mt-2 leading-relaxed whitespace-pre-wrap select-text">
                  {reasoning}
                </p>
              </details>
            )}

            <div className="text-foreground">
              {showThinking ? (
                <ChatThinkingLabel />
              ) : isUser ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap select-text">
                  {text}
                </p>
              ) : (
                <AssistantMessageContent
                  messageId={message.id}
                  text={text}
                  isStreaming={Boolean(isStreaming)}
                />
              )}
            </div>

            {showUnsupported && (
              <p className="text-muted-foreground mt-2 text-xs">
                {t('unsupportedPart')}
              </p>
            )}
          </div>

          {showActions && (
            <div className="flex items-center gap-1 pt-0.5">
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
              {canRegenerate && onRegenerate && !isStreaming && (
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
        </div>
      </div>
    </div>
  )
}

