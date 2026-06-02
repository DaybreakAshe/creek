'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface PaginatedInfiniteGridProps<T> {
  items: T[]
  getItemKey: (item: T, index: number) => string
  renderItem: (item: T, index: number) => ReactNode
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
  footer?: ReactNode
  className?: string
  gridClassName?: string
}

/**
 * 无限滚动网格：普通 CSS Grid + IntersectionObserver。
 * 适用于可变高度卡片；VirtuosoGrid 在此场景下滚动位置容易错乱。
 */
export function PaginatedInfiniteGrid<T>({
  items,
  getItemKey,
  renderItem,
  hasMore,
  loadingMore,
  onLoadMore,
  footer,
  className,
  gridClassName,
}: PaginatedInfiniteGridProps<T>) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(loadingMore)
  const hasMoreRef = useRef(hasMore)

  loadingRef.current = loadingMore
  hasMoreRef.current = hasMore

  useEffect(() => {
    if (!hasMore) return

    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          hasMoreRef.current &&
          !loadingRef.current
        ) {
          onLoadMore()
        }
      },
      { rootMargin: '240px 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, onLoadMore, items.length])

  return (
    <div className={className}>
      <div
        className={cn(
          'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3',
          gridClassName
        )}
      >
        {items.map((item, index) => (
          <div key={getItemKey(item, index)}>{renderItem(item, index)}</div>
        ))}
      </div>

      {(hasMore || loadingMore) && (
        <div
          ref={sentinelRef}
          className="flex min-h-16 items-center justify-center py-6"
          aria-live="polite"
        >
          {loadingMore ? footer : null}
        </div>
      )}
    </div>
  )
}
