import type { UIMessage } from '@ai-sdk/react'

export type { UIMessage }

export type ChatSession = {
  id: string
  title: string
  messages: UIMessage[]
  createdAt: number
  updatedAt: number
}

export type ChatSessionsState = {
  sessions: ChatSession[]
  activeId: string | null
}
