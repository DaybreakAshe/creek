import type { PaginatedResponse } from '@/lib/pagination/types'
import type { UIMessage } from '@/lib/chat/types'
import type { ChatSessionSummary } from '@/lib/chat/server'
import {
  CHAT_MESSAGE_PAGE_SIZE,
  CHAT_SESSION_PAGE_SIZE,
} from '@/lib/chat/constants'
import { buildPaginatedUrl } from '@/lib/pagination/client'

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const code = typeof data.error === 'string' ? data.error : undefined
    throw new Error(code ?? 'unknown')
  }
  return data as T
}

export async function fetchChatSessions(page = 1, limit = CHAT_SESSION_PAGE_SIZE) {
  const url = buildPaginatedUrl('/api/chat/sessions', { page, limit })
  return parseJson<PaginatedResponse<ChatSessionSummary>>(await fetch(url))
}

export async function createChatSessionApi(sessionId: string, title: string) {
  const response = await fetch('/api/chat/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, title }),
  })
  return parseJson<ChatSessionSummary>(response)
}

export async function deleteChatSessionApi(sessionId: string) {
  const response = await fetch(`/api/chat/sessions/${sessionId}`, {
    method: 'DELETE',
  })
  return parseJson<{ ok: true }>(response)
}

export async function fetchChatSession(sessionId: string) {
  const response = await fetch(`/api/chat/sessions/${sessionId}`)
  return parseJson<ChatSessionSummary>(response)
}

export async function fetchChatMessages(
  sessionId: string,
  page = 1,
  limit = CHAT_MESSAGE_PAGE_SIZE,
  order: 'asc' | 'desc' = 'asc'
) {
  const url = buildPaginatedUrl(`/api/chat/sessions/${sessionId}/messages`, {
    page,
    limit,
    order,
  })
  return parseJson<PaginatedResponse<UIMessage>>(await fetch(url))
}

export async function saveChatMessagesApi(
  sessionId: string,
  messages: UIMessage[],
  fallbackTitle: string
) {
  const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, fallbackTitle }),
  })
  return parseJson<ChatSessionSummary>(response)
}

/** 拉取会话全部消息（按页合并，用于打开对话）。 */
export async function fetchAllChatMessages(sessionId: string) {
  const all: UIMessage[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const result = await fetchChatMessages(sessionId, page, CHAT_MESSAGE_PAGE_SIZE)
    all.push(...result.items)
    hasMore = result.pagination.hasMore
    page += 1
  }

  return all
}
