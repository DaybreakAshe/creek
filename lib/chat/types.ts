import type { UIMessage } from '@ai-sdk/react'

export type { UIMessage }

export type { ChatSessionSummary } from '@/lib/chat/server'

/** @deprecated 仅兼容旧代码；列表项请用 ChatSessionSummary */
export type ChatSession = {
  id: string
  title: string
  messages?: UIMessage[]
  createdAt: number
  updatedAt: number
  messageCount?: number
}

/** @deprecated localStorage 方案已弃用 */
export type ChatSessionsState = {
  sessions: ChatSession[]
  activeId: string | null
}
