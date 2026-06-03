'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  createEmptySession,
  loadChatSessions,
  saveChatSessions,
  upsertSessionMessages,
} from '@/lib/chat/storage'
import { normalizeMessagesForStorage } from '@/lib/chat/message-utils'
import type { ChatSession, UIMessage } from '@/lib/chat/types'

function createChatId() {
  return crypto.randomUUID()
}

export function useChatSessions(userId: string | undefined, newChatTitle: string) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (!userId) {
      setSessions([])
      setActiveId(null)
      setHydrated(true)
      return
    }

    const stored = loadChatSessions(userId)
    setSessions(stored.sessions)
    setActiveId(stored.activeId)
    setHydrated(true)
  }, [userId])

  const persist = useCallback(
    (nextSessions: ChatSession[], nextActiveId: string | null) => {
      setSessions(nextSessions)
      setActiveId(nextActiveId)
      if (userId) {
        saveChatSessions(userId, {
          sessions: nextSessions,
          activeId: nextActiveId,
        })
      }
    },
    [userId]
  )

  const createSession = useCallback(() => {
    const id = createChatId()
    const session = createEmptySession(id, newChatTitle)
    const nextSessions = [session, ...sessions]
    persist(nextSessions, id)
    return id
  }, [sessions, persist, newChatTitle])

  const selectSession = useCallback(
    (id: string) => {
      persist(sessions, id)
    },
    [sessions, persist]
  )

  const deleteSession = useCallback(
    (id: string) => {
      const nextSessions = sessions.filter((s) => s.id !== id)
      const nextActiveId =
        activeId === id ? (nextSessions[0]?.id ?? null) : activeId
      persist(nextSessions, nextActiveId)
    },
    [sessions, activeId, persist]
  )

  const saveMessages = useCallback(
    (sessionId: string, messages: UIMessage[]) => {
      const nextSessions = upsertSessionMessages(
        sessions,
        sessionId,
        normalizeMessagesForStorage(messages),
        newChatTitle
      )
      persist(nextSessions, sessionId)
    },
    [sessions, persist, newChatTitle]
  )

  const activeSession = sessions.find((s) => s.id === activeId) ?? null

  return {
    sessions,
    activeId,
    activeSession,
    hydrated,
    createSession,
    selectSession,
    deleteSession,
    saveMessages,
  }
}
