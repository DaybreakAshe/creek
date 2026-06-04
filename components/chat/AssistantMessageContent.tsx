'use client'

import { ChatMarkdown } from '@/components/chat/ChatMarkdown'

interface AssistantMessageContentProps {
  messageId: string
  text: string
  isStreaming: boolean
}

/** 流式用纯文本（DOM 稳定）；结束后用 Markdown，避免流式阶段重解析导致选区错乱。 */
export function AssistantMessageContent({
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
}
