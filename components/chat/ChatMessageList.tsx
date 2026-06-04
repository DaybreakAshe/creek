'use client'

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import type { UIMessage } from '@/lib/chat/types'
import { Button } from '@/components/ui/button'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatEmptyState } from '@/components/chat/ChatEmptyState'
import { ChatPendingReply } from '@/components/chat/ChatPendingReply'
import { getMessageText } from '@/lib/chat/message-utils'

interface ChatMessageListProps {
  chatId: string
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
  chatId,
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
  const prevStatusRef = useRef(status)
  const prevChatIdRef = useRef<string | null>(null)
  const prevMessagesLengthRef = useRef(0)
  const isBusy = status === 'submitted' || status === 'streaming'
  const awaitingReply = status === 'submitted'
  const lastMessage = messages.at(-1)
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')
  const lastAssistantId = lastAssistant?.id ?? null
  const streamingAssistantTextLength =
    isBusy && lastAssistant ? getMessageText(lastAssistant).length : 0

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

  const scrollContainerToBottom = useCallback(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [])

  const forceScrollToBottom = useCallback(() => {
    blockAutoScrollRef.current = false
    pinnedToBottomRef.current = true
    scrollContainerToBottom()
  }, [scrollContainerToBottom])

  /** 切换会话：立即定位到最新消息 */
  useLayoutEffect(() => {
    if (prevChatIdRef.current === chatId) return
    prevChatIdRef.current = chatId
    prevMessagesLengthRef.current = messages.length
    forceScrollToBottom()
    const frame = requestAnimationFrame(scrollContainerToBottom)
    return () => cancelAnimationFrame(frame)
  }, [chatId, messages.length, forceScrollToBottom, scrollContainerToBottom])

  /** 会话消息首次载入（0 → N） */
  useLayoutEffect(() => {
    const prevLen = prevMessagesLengthRef.current
    prevMessagesLengthRef.current = messages.length
    if (prevLen === 0 && messages.length > 0) {
      forceScrollToBottom()
      const frame = requestAnimationFrame(scrollContainerToBottom)
      return () => cancelAnimationFrame(frame)
    }
  }, [messages.length, forceScrollToBottom, scrollContainerToBottom])

  /** 发送新消息时强制跳到底部；流式回复仅在用户已贴底时跟随 */
  useLayoutEffect(() => {
    const userJustSent =
      status === 'submitted' && prevStatusRef.current === 'ready'
    prevStatusRef.current = status

    if (userJustSent) {
      forceScrollToBottom()
      return
    }

    if (blockAutoScrollRef.current || !pinnedToBottomRef.current) return
    scrollContainerToBottom()
  }, [
    status,
    messages.length,
    awaitingReply,
    streamingAssistantTextLength,
    forceScrollToBottom,
    scrollContainerToBottom,
  ])

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
      {messages.map((message) => {
        const isStreamingMessage =
          isBusy &&
          message.role === 'assistant' &&
          message.id === lastAssistantId

        return (
        <ChatMessage
          key={
            isStreamingMessage
              ? `${message.id}-${getMessageText(message).length}`
              : message.id
          }
          message={message}
          isStreaming={isStreamingMessage}
          canRegenerate={
            !isBusy &&
            message.role === 'assistant' &&
            message.id === lastAssistantId
          }
          onRegenerate={handleRegenerate}
        />
        )
      })}
      {awaitingReply && <ChatPendingReply />}
      <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
    </div>
  )
}
