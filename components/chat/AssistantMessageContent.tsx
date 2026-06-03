'use client'

import { memo } from 'react'
import { ChatMarkdown } from '@/components/chat/ChatMarkdown'

interface AssistantMessageContentProps {
  messageId: string
  text: string
  isStreaming: boolean
}

/** 流式用纯文本（DOM 稳定）；结束后用 memo 的 Markdown，避免重渲染导致选区错乱。 */
export const AssistantMessageContent = memo(
  function AssistantMessageContent({
    messageId,
    text,
    isStreaming,
  }: AssistantMessageContentProps) {
    if (!text) return null

    if (isStreaming) {
      return (
        <div
          className="text-sm leading-relaxed whitespace-pre-wrap select-text"
          data-message-id={messageId}
        >
          {text}
        </div>
      )
    }

    return <ChatMarkdown content={text} />
  },
  (prev, next) =>
    prev.messageId === next.messageId &&
    prev.text === next.text &&
    prev.isStreaming === next.isStreaming
)
