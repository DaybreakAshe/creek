'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PaginationMeta } from '@/lib/pagination/types'
import type { UIMessage } from '@/lib/chat/types'
import { fetchChatMessages } from '@/lib/chat/api-client'
import { CHAT_MESSAGE_PAGE_SIZE } from '@/lib/chat/constants'

const emptyPagination = (): PaginationMeta => ({
  page: 1,
  limit: CHAT_MESSAGE_PAGE_SIZE,
  total: 0,
  totalPages: 0,
  hasMore: false,
})

export function useChatMessages(sessionId: string | null) {
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination)
  const [loading, setLoading] = useState(false)
  const [loadingEarlier, setLoadingEarlier] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadInitial = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchChatMessages(id, 1, CHAT_MESSAGE_PAGE_SIZE, 'desc')
      setMessages(result.items)
      setPagination(result.pagination)
    } catch (err) {
      setMessages([])
      setPagination(emptyPagination())
      setError(err instanceof Error ? err.message : 'unknown')
    } finally {
      setLoading(false)
    }
  }, [])

  const requestIdRef = useRef(0)
  const inflightRef = useRef<Map<string, Promise<void>>>(new Map())

  useEffect(() => {
    if (!sessionId) {
      setMessages([])
      setPagination(emptyPagination())
      setError(null)
      setLoading(false)
      return
    }

    const requestId = ++requestIdRef.current
    let inflight = inflightRef.current.get(sessionId)
    if (!inflight) {
      inflight = loadInitial(sessionId).finally(() => {
        inflightRef.current.delete(sessionId)
      })
      inflightRef.current.set(sessionId, inflight)
    }

    void inflight.then(() => {
      if (requestId !== requestIdRef.current) return
    })
  }, [sessionId, loadInitial])

  const loadEarlierMessages = useCallback(async () => {
    if (!sessionId || !pagination.hasMore || loadingEarlier) return

    setLoadingEarlier(true)
    try {
      const result = await fetchChatMessages(
        sessionId,
        pagination.page + 1,
        CHAT_MESSAGE_PAGE_SIZE,
        'desc'
      )
      setMessages((prev) => [...result.items, ...prev])
      setPagination(result.pagination)
    } finally {
      setLoadingEarlier(false)
    }
  }, [sessionId, pagination, loadingEarlier])

  return {
    messages,
    pagination,
    loading,
    loadingEarlier,
    error,
    loadEarlierMessages,
    hasEarlierMessages: pagination.hasMore,
  }
}
