'use client'

import { useEffect, useRef } from 'react'
import type { UIMessage } from '@/lib/chat/types'
import { getMessageText } from '@/lib/chat/message-utils'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatEmptyState } from '@/components/chat/ChatEmptyState'
import { ChatPendingReply } from '@/components/chat/ChatPendingReply'

interface ChatMessageListProps {
  messages: UIMessage[]
  status: 'submitted' | 'streaming' | 'ready' | 'error'
  onSuggestionSelect: (text: string) => void
  onRegenerate: () => void
}

const SCROLL_PIN_THRESHOLD = 96

export function ChatMessageList({
  messages,
  status,
  onSuggestionSelect,
  onRegenerate,
}: ChatMessageListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pinnedToBottomRef = useRef(true)
  const isBusy = status === 'submitted' || status === 'streaming'
  const awaitingReply = status === 'submitted'
  const lastMessage = messages.at(-1)
  const lastAssistantId =
    [...messages].reverse().find((m) => m.role === 'assistant')?.id ?? null
  const lastStreamTextLen =
    lastMessage && isBusy ? getMessageText(lastMessage).length : 0

  useEffect(() => {
    const el = listRef.current
    if (!el) return

    const updatePinned = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight
      pinnedToBottomRef.current = distanceFromBottom <= SCROLL_PIN_THRESHOLD
    }

    updatePinned()
    el.addEventListener('scroll', updatePinned, { passive: true })
    return () => el.removeEventListener('scroll', updatePinned)
  }, [])

  useEffect(() => {
    if (!pinnedToBottomRef.current) return
    bottomRef.current?.scrollIntoView({
      behavior: isBusy ? 'auto' : 'smooth',
      block: 'end',
    })
  }, [messages.length, status, awaitingReply, isBusy])

  useEffect(() => {
    if (!isBusy || !pinnedToBottomRef.current) return

    const selection = document.getSelection()
    if (
      selection &&
      !selection.isCollapsed &&
      listRef.current?.contains(selection.anchorNode)
    ) {
      return
    }

    bottomRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
  }, [lastStreamTextLen, isBusy])

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <ChatEmptyState onSelect={onSuggestionSelect} />
      </div>
    )
  }

  return (
    <div
      ref={listRef}
      className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
    >
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
          onRegenerate={onRegenerate}
        />
      ))}
      {awaitingReply && <ChatPendingReply />}
      <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
    </div>
  )
}
