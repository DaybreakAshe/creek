'use client'

import { useCallback, useEffect, useState } from 'react'
import type { PaginationMeta } from '@/lib/pagination/types'
import type { ChatSessionSummary } from '@/lib/chat/server'
import type { UIMessage } from '@/lib/chat/types'
import {
  createChatSessionApi,
  deleteChatSessionApi,
  fetchChatSession,
  fetchChatSessions,
  saveChatMessagesApi,
} from '@/lib/chat/api-client'
import { CHAT_SESSION_PAGE_SIZE } from '@/lib/chat/constants'

function createChatId() {
  return crypto.randomUUID()
}

const emptyPagination = (): PaginationMeta => ({
  page: 1,
  limit: CHAT_SESSION_PAGE_SIZE,
  total: 0,
  totalPages: 0,
  hasMore: false,
})

export function useChatSessions(userId: string | undefined, newChatTitle: string) {
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination)
  const [hydrated, setHydrated] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const refreshSessions = useCallback(async () => {
    if (!userId) {
      setSessions([])
      setPagination(emptyPagination())
      setHydrated(true)
      return
    }

    const result = await fetchChatSessions(1, CHAT_SESSION_PAGE_SIZE)
    setSessions(result.items)
    setPagination(result.pagination)
    setHydrated(true)
  }, [userId])

  useEffect(() => {
    setHydrated(false)
    void refreshSessions().catch(() => {
      setSessions([])
      setPagination(emptyPagination())
      setHydrated(true)
    })
  }, [refreshSessions])

  const loadMoreSessions = useCallback(async () => {
    if (!userId || !pagination.hasMore || loadingMore) return

    setLoadingMore(true)
    try {
      const result = await fetchChatSessions(
        pagination.page + 1,
        CHAT_SESSION_PAGE_SIZE
      )
      setSessions((prev) => [...prev, ...result.items])
      setPagination(result.pagination)
    } finally {
      setLoadingMore(false)
    }
  }, [userId, pagination, loadingMore])

  const upsertSessionInList = useCallback((session: ChatSessionSummary) => {
    setSessions((prev) => {
      const index = prev.findIndex((s) => s.id === session.id)
      if (index === -1) {
        return [session, ...prev]
      }
      const next = [...prev]
      next[index] = session
      return next.sort((a, b) => b.updatedAt - a.updatedAt)
    })
  }, [])

  const createSession = useCallback(async () => {
    const empty = sessions.find((s) => s.messageCount === 0)
    if (empty) {
      return empty.id
    }

    const id = createChatId()
    const session = await createChatSessionApi(id, newChatTitle)
    upsertSessionInList(session)
    setPagination((prev) => ({
      ...prev,
      total: prev.total + 1,
    }))
    return session.id
  }, [sessions, newChatTitle, upsertSessionInList])

  const deleteSession = useCallback(
    async (id: string) => {
      await deleteChatSessionApi(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }))
    },
    []
  )

  const saveMessages = useCallback(
    async (sessionId: string, messages: UIMessage[]) => {
      const session = await saveChatMessagesApi(
        sessionId,
        messages,
        newChatTitle
      )
      upsertSessionInList(session)
    },
    [newChatTitle, upsertSessionInList]
  )

  const ensureSession = useCallback(
    async (sessionId: string) => {
      if (sessions.some((s) => s.id === sessionId)) {
        return true
      }

      try {
        const session = await fetchChatSession(sessionId)
        upsertSessionInList(session)
        return true
      } catch {
        return false
      }
    },
    [sessions, upsertSessionInList]
  )

  return {
    sessions,
    pagination,
    hydrated,
    loadingMore,
    refreshSessions,
    loadMoreSessions,
    createSession,
    deleteSession,
    saveMessages,
    ensureSession,
  }
}
