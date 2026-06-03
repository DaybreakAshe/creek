'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import type { UIMessage } from '@/lib/chat/types'
import { Button } from '@/components/ui/button'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatEmptyState } from '@/components/chat/ChatEmptyState'
import { ChatPendingReply } from '@/components/chat/ChatPendingReply'

interface ChatMessageListProps {
  className?: string
  messages: UIMessage[]
  status: 'submitted' | 'streaming' | 'ready' | 'error'
  onSuggestionSelect: (text: string) => void
  onRegenerate: () => void
  hasEarlierMessages?: boolean
  loadingEarlier?: boolean
  onLoadEarlier?: () => void
}

const SCROLL_PIN_THRESHOLD = 96

export function ChatMessageList({
  className,
  messages,
  status,
  onSuggestionSelect,
  onRegenerate,
  hasEarlierMessages,
  loadingEarlier,
  onLoadEarlier,
}: ChatMessageListProps) {
  const t = useTranslations('chat')
  const tCommon = useTranslations('common')
  const listRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pinnedToBottomRef = useRef(true)
  const blockAutoScrollRef = useRef(false)
  const isBusy = status === 'submitted' || status === 'streaming'
  const awaitingReply = status === 'submitted'
  const lastMessage = messages.at(-1)
  const lastAssistantId =
    [...messages].reverse().find((m) => m.role === 'assistant')?.id ?? null

  const handleRegenerate = useCallback(() => {
    onRegenerate()
  }, [onRegenerate])

  useEffect(() => {
    const el = listRef.current
    if (!el) return

    const updatePinned = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight
      pinnedToBottomRef.current = distanceFromBottom <= SCROLL_PIN_THRESHOLD
    }

    const pauseAutoScroll = () => {
      blockAutoScrollRef.current = true
    }

    const resumeAutoScroll = () => {
      blockAutoScrollRef.current = false
      updatePinned()
    }

    const onSelectionChange = () => {
      const selection = document.getSelection()
      if (
        selection &&
        !selection.isCollapsed &&
        el.contains(selection.anchorNode)
      ) {
        blockAutoScrollRef.current = true
      }
    }

    updatePinned()
    el.addEventListener('scroll', updatePinned, { passive: true })
    el.addEventListener('pointerdown', pauseAutoScroll)
    el.addEventListener('pointerup', resumeAutoScroll)
    el.addEventListener('pointercancel', resumeAutoScroll)
    document.addEventListener('selectionchange', onSelectionChange)

    return () => {
      el.removeEventListener('scroll', updatePinned)
      el.removeEventListener('pointerdown', pauseAutoScroll)
      el.removeEventListener('pointerup', resumeAutoScroll)
      el.removeEventListener('pointercancel', resumeAutoScroll)
      document.removeEventListener('selectionchange', onSelectionChange)
    }
  }, [])

  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    if (blockAutoScrollRef.current || !pinnedToBottomRef.current) return
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' })
  }, [])

  useEffect(() => {
    scrollToBottom(isBusy ? 'auto' : 'smooth')
  }, [messages.length, status, awaitingReply, isBusy, scrollToBottom])

  if (messages.length === 0) {
    return <ChatEmptyState onSelect={onSuggestionSelect} className={className} />
  }

  return (
    <div
      ref={listRef}
      className={`flex min-h-0 flex-col overflow-y-auto overscroll-contain ${className ?? 'flex-1'}`.trim()}
    >
      {hasEarlierMessages && onLoadEarlier && (
        <div className="flex justify-center px-4 py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            disabled={loadingEarlier}
            onClick={onLoadEarlier}
          >
            {loadingEarlier ? tCommon('loadingMore') : t('loadEarlierMessages')}
          </Button>
        </div>
      )}
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          isStreaming={
            isBusy &&
            message.id === lastMessage?.id &&
            message.role === 'assistant'
          }
          canRegenerate={
            !isBusy &&
            message.role === 'assistant' &&
            message.id === lastAssistantId
          }
          onRegenerate={handleRegenerate}
        />
      ))}
      {awaitingReply && <ChatPendingReply />}
      <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
    </div>
  )
}
