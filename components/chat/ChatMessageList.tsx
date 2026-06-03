'use client'

import { useEffect, useRef } from 'react'
import type { UIMessage } from '@/lib/chat/types'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatEmptyState } from '@/components/chat/ChatEmptyState'

interface ChatMessageListProps {
  messages: UIMessage[]
  status: 'submitted' | 'streaming' | 'ready' | 'error'
  onSuggestionSelect: (text: string) => void
  onRegenerate: () => void
}

export function ChatMessageList({
  messages,
  status,
  onSuggestionSelect,
  onRegenerate,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const isBusy = status === 'submitted' || status === 'streaming'
  const lastMessage = messages.at(-1)
  const lastAssistantId =
    [...messages].reverse().find((m) => m.role === 'assistant')?.id ?? null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  if (messages.length === 0) {
    return <ChatEmptyState onSelect={onSuggestionSelect} />
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
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
      <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
    </div>
  )
}
