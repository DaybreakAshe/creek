'use client'

import { useEffect, useState } from 'react'

/** 拼音/日文等 IME 组字结束后再防抖，避免搜到未完成的拼音 */
const DEFAULT_DEBOUNCE_MS = 500

export function useDebouncedSearch(debounceMs = DEFAULT_DEBOUNCE_MS) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isComposing, setIsComposing] = useState(false)

  useEffect(() => {
    if (isComposing) return

    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
    }, debounceMs)

    return () => window.clearTimeout(timer)
  }, [searchQuery, debounceMs, isComposing])

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = (
    e: React.CompositionEvent<HTMLInputElement>
  ) => {
    setIsComposing(false)
    const value = e.currentTarget.value
    setSearchQuery(value)
  }

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    isComposing,
    handleCompositionStart,
    handleCompositionEnd,
  }
}

export interface UseListSearchFetchUiOptions {
  loading: boolean
  searchQuery: string
  debouncedSearch: string
  /** IME 组字中时不视为「待搜索」 */
  isComposing?: boolean
  enabled?: boolean
  loadingMore?: boolean
  resetDeps?: unknown[]
}

/** 首屏全页 loading vs 搜索时输入框转圈（需配合 useDebouncedSearch） */
export function useListSearchFetchUi({
  loading,
  searchQuery,
  debouncedSearch,
  isComposing = false,
  enabled = true,
  loadingMore = false,
  resetDeps = [],
}: UseListSearchFetchUiOptions) {
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  useEffect(() => {
    setInitialLoadDone(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps)

  useEffect(() => {
    if (enabled && !loading) {
      setInitialLoadDone(true)
    }
  }, [enabled, loading])

  const isInitialLoad = enabled && loading && !initialLoadDone
  const isSearchPending =
    !isComposing && searchQuery.trim() !== debouncedSearch
  const isSearchRefetching = loading && initialLoadDone && !loadingMore
  const showSearchSpinner = isSearchPending || isSearchRefetching

  return { isInitialLoad, showSearchSpinner }
}

export interface UseListSearchUiOptions {
  loading: boolean
  enabled?: boolean
  loadingMore?: boolean
  debounceMs?: number
  resetDeps?: unknown[]
}

/** 防抖搜索 + 列表 fetch 时的 loading UI 状态 */
export function useListSearchUi({
  loading,
  enabled = true,
  loadingMore = false,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  resetDeps = [],
}: UseListSearchUiOptions) {
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    isComposing,
    handleCompositionStart,
    handleCompositionEnd,
  } = useDebouncedSearch(debounceMs)
  const { isInitialLoad, showSearchSpinner } = useListSearchFetchUi({
    loading,
    searchQuery,
    debouncedSearch,
    isComposing,
    enabled,
    loadingMore,
    resetDeps,
  })

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    isInitialLoad,
    showSearchSpinner,
    handleCompositionStart,
    handleCompositionEnd,
  }
}
