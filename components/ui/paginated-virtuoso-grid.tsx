'use client'

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { VirtuosoGrid, type GridComponents } from 'react-virtuoso'
import { cn } from '@/lib/utils'

const GridList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3',
        className
      )}
      style={style}
      {...props}
    />
  )
)
GridList.displayName = 'GridList'

function GridItem({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('min-w-0', className)} {...props} />
}

const gridComponents: GridComponents = {
  List: GridList,
  Item: GridItem,
}

export interface PaginatedVirtuosoGridProps<T> {
  items: T[]
  getItemKey: (item: T, index: number) => string
  renderItem: (item: T, index: number) => ReactNode
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
  footer?: ReactNode
  className?: string
  overscan?: number
}

export function PaginatedVirtuosoGrid<T>({
  items,
  getItemKey,
  renderItem,
  hasMore,
  loadingMore,
  onLoadMore,
  footer,
  className,
  overscan = 200,
}: PaginatedVirtuosoGridProps<T>) {
  return (
    <VirtuosoGrid
      useWindowScroll
      data={items}
      overscan={overscan}
      endReached={() => {
        if (hasMore && !loadingMore) onLoadMore()
      }}
      computeItemKey={(index, item) => getItemKey(item, index)}
      itemContent={(index, item) => renderItem(item, index)}
      components={{
        ...gridComponents,
        Footer: () => {
          if (!loadingMore) return null
          return (
            <div className={cn('py-6 text-center', className)}>
              {footer}
            </div>
          )
        },
      }}
    />
  )
}
