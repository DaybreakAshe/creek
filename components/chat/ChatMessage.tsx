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

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-5',
        isUser ? 'bg-transparent' : 'bg-muted/30'
      )}
    >
      {isUser ? <ChatUserAvatar /> : <ChatAssistantAvatar />}

      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-muted-foreground pointer-events-none text-xs font-medium select-none">
          {isUser ? t('you') : t('assistant')}
        </p>

        {reasoning && !isStreaming && (
          <details className="text-muted-foreground text-xs">
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

        {showUnsupported && (
          <p className="text-muted-foreground text-xs">{t('unsupportedPart')}</p>
        )}
      </div>
    </div>
  )
}

