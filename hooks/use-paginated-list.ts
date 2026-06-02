'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  buildPaginatedUrl,
  DEFAULT_LIST_PAGE_SIZE,
  fetchPaginatedList,
  type PaginatedListQuery,
} from '@/lib/pagination/client'
import type { PaginationMeta } from '@/lib/pagination/types'

export interface UsePaginatedListOptions {
  /** API 路径，如 `/api/tools` */
  basePath: string
  /** 除 page / limit / q 外的查询参数 */
  query?: Omit<PaginatedListQuery, 'page' | 'limit' | 'q'>
  /** 搜索关键词，变化时会重置列表 */
  search?: string
  limit?: number
  enabled?: boolean
  /** 变化时重置并重新拉取第一页 */
  resetDeps?: unknown[]
}

export interface UsePaginatedListResult<T> {
  items: T[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  pagination: PaginationMeta | null
  hasMore: boolean
  refresh: () => void
  loadMore: () => void
}

export function usePaginatedList<T>({
  basePath,
  query = {},
  search = '',
  limit = DEFAULT_LIST_PAGE_SIZE,
  enabled = true,
  resetDeps = [],
}: UsePaginatedListOptions): UsePaginatedListResult<T> {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)

  const pageRef = useRef(1)
  const fetchingRef = useRef(false)
  const [refreshToken, setRefreshToken] = useState(0)

  const buildUrl = useCallback(
    (page: number) =>
      buildPaginatedUrl(basePath, {
        ...query,
        page,
        limit,
        ...(search ? { q: search } : {}),
      }),
    [basePath, query, limit, search]
  )

  const fetchPage = useCallback(
    async (page: number, mode: 'replace' | 'append') => {
      if (!enabled || fetchingRef.current) return

      fetchingRef.current = true
      if (mode === 'replace') {
        setLoading(true)
        setError(null)
      } else {
        setLoadingMore(true)
      }

      try {
        const data = await fetchPaginatedList<T>(buildUrl(page))
        pageRef.current = page
        setPagination(data.pagination)
        setItems((prev) =>
          mode === 'append' ? [...prev, ...data.items] : data.items
        )
        setError(null)
      } catch (err) {
        if (mode === 'replace') {
          setItems([])
          setPagination(null)
        }
        setError(err instanceof Error ? err.message : 'fetchFailed')
      } finally {
        fetchingRef.current = false
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [buildUrl, enabled]
  )

  const refresh = useCallback(() => {
    setRefreshToken((token) => token + 1)
  }, [])

  const loadMore = useCallback(() => {
    if (!enabled || loading || loadingMore || !pagination?.hasMore) return
    void fetchPage(pageRef.current + 1, 'append')
  }, [enabled, fetchPage, loading, loadingMore, pagination?.hasMore])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    pageRef.current = 1
    void fetchPage(1, 'replace')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, basePath, limit, search, refreshToken, ...resetDeps])

  return {
    items,
    loading,
    loadingMore,
    error,
    pagination,
    hasMore: pagination?.hasMore ?? false,
    refresh,
    loadMore,
  }
}
