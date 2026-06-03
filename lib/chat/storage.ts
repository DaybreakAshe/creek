import type { UIMessage } from '@/lib/chat/types'
import type { ChatSession, ChatSessionsState } from '@/lib/chat/types'
import { deriveChatTitle } from '@/lib/chat/message-utils'

const STORAGE_VERSION = 'v1'

function storageKey(userId: string) {
  return `creek-chat-${STORAGE_VERSION}-${userId}`
}

export function loadChatSessions(userId: string): ChatSessionsState {
  if (typeof window === 'undefined') {
    return { sessions: [], activeId: null }
  }

  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return { sessions: [], activeId: null }

    const parsed = JSON.parse(raw) as ChatSessionsState
    if (!Array.isArray(parsed.sessions)) {
      return { sessions: [], activeId: null }
    }

    return {
      sessions: parsed.sessions,
      activeId: parsed.activeId ?? null,
    }
  } catch {
    return { sessions: [], activeId: null }
  }
}

export function saveChatSessions(userId: string, state: ChatSessionsState) {
  if (typeof window === 'undefined') return
  localStorage.setItem(storageKey(userId), JSON.stringify(state))
}

export function createEmptySession(
  id: string,
  title: string
): ChatSession {
  const now = Date.now()
  return {
    id,
    title,
    messages: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function upsertSessionMessages(
  sessions: ChatSession[],
  sessionId: string,
  messages: UIMessage[],
  fallbackTitle: string
): ChatSession[] {
  const now = Date.now()
  const exists = sessions.some((s) => s.id === sessionId)

  if (!exists) {
    return [
      {
        id: sessionId,
        title: deriveChatTitle(messages, fallbackTitle),
        messages,
        createdAt: now,
        updatedAt: now,
      },
      ...sessions,
    ]
  }

  return sessions.map((session) =>
    session.id === sessionId
      ? {
          ...session,
          title:
            session.title === fallbackTitle
              ? deriveChatTitle(messages, fallbackTitle)
              : session.title,
          messages,
          updatedAt: now,
        }
      : session
  )
}
