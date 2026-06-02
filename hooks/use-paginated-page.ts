'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  buildPaginatedUrl,
  fetchPaginatedList,
  type PaginatedListQuery,
} from '@/lib/pagination/client'
import { ADMIN_PAGE_SIZE } from '@/lib/pagination/types'
import type { PaginationMeta } from '@/lib/pagination/types'

export interface UsePaginatedPageOptions {
  basePath: string
  query?: Omit<PaginatedListQuery, 'page' | 'limit' | 'q'>
  search?: string
  limit?: number
  enabled?: boolean
  resetDeps?: unknown[]
}

export interface UsePaginatedPageResult<T> {
  items: T[]
  page: number
  pagination: PaginationMeta | null
  loading: boolean
  error: string | null
  setPage: (page: number) => void
  refresh: () => void
}

export function usePaginatedPage<T>({
  basePath,
  query = {},
  search = '',
  limit = ADMIN_PAGE_SIZE,
  enabled = true,
  resetDeps = [],
}: UsePaginatedPageOptions): UsePaginatedPageResult<T> {
  const [page, setPageState] = useState(1)
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)

  const fetchingRef = useRef(false)
  const pageRef = useRef(1)
  const prevSearchRef = useRef(search)

  const buildUrl = useCallback(
    (targetPage: number) =>
      buildPaginatedUrl(basePath, {
        ...query,
        page: targetPage,
        limit,
        ...(search ? { q: search } : {}),
      }),
    [basePath, query, limit, search]
  )

  const setPage = useCallback((nextPage: number) => {
    pageRef.current = Math.max(nextPage, 1)
    setPageState(pageRef.current)
  }, [])

  const fetchPage = useCallback(
    async (targetPage: number) => {
      if (!enabled || fetchingRef.current) return

      fetchingRef.current = true
      setLoading(true)
      setError(null)

      try {
        const data = await fetchPaginatedList<T>(buildUrl(targetPage))

        if (
          data.items.length === 0 &&
          data.pagination.totalPages > 0 &&
          targetPage > data.pagination.totalPages
        ) {
          setPage(data.pagination.totalPages)
          return
        }

        pageRef.current = data.pagination.page
        setPageState(data.pagination.page)
        setItems(data.items)
        setPagination(data.pagination)
      } catch (err) {
        setItems([])
        setPagination(null)
        setError(err instanceof Error ? err.message : 'fetchFailed')
      } finally {
        fetchingRef.current = false
        setLoading(false)
      }
    },
    [buildUrl, enabled, setPage]
  )

  const refresh = useCallback(() => {
    setRefreshToken((token) => token + 1)
  }, [])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    let targetPage = pageRef.current

    if (prevSearchRef.current !== search) {
      prevSearchRef.current = search
      targetPage = 1
      pageRef.current = 1
      setPageState(1)
    }

    void fetchPage(targetPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, page, search, refreshToken, basePath, limit, ...resetDeps])

  return {
    items,
    page,
    pagination,
    loading,
    error,
    setPage,
    refresh,
  }
}
