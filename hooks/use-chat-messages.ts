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

export function useChatMessages(sessionId: string) {
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination)
  const [loading, setLoading] = useState(true)
  const [loadingEarlier, setLoadingEarlier] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const loadInitial = useCallback(async (id: string, requestId: number) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchChatMessages(id, 1, CHAT_MESSAGE_PAGE_SIZE, 'desc')
      if (requestId !== requestIdRef.current) return
      setMessages(result.items)
      setPagination(result.pagination)
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      const code = err instanceof Error ? err.message : ''
      if (code === 'chatSessionNotFound') {
        setMessages([])
        setPagination(emptyPagination())
        setError(null)
      } else {
        setMessages([])
        setPagination(emptyPagination())
        setError(code || 'unknown')
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const requestId = ++requestIdRef.current
    void loadInitial(sessionId, requestId)
  }, [sessionId, loadInitial])

  const loadEarlierMessages = useCallback(async () => {
    if (!pagination.hasMore || loadingEarlier) return

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
