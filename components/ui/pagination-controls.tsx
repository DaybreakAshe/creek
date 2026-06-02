'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationControlsProps {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
  disabled?: boolean
  className?: string
}

function getVisiblePages(
  current: number,
  totalPages: number
): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]

  if (current > 3) {
    pages.push('ellipsis')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(totalPages - 1, current + 1)

  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }

  if (current < totalPages - 2) {
    pages.push('ellipsis')
  }

  pages.push(totalPages)
  return pages
}

export function PaginationControls({
  page,
  totalPages,
  total,
  onPageChange,
  disabled = false,
  className,
}: PaginationControlsProps) {
  const t = useTranslations('common')

  if (totalPages <= 1) {
    if (total === 0) return null

    return (
      <p className={cn('text-muted-foreground text-sm', className)}>
        {t('paginationTotal', { total })}
      </p>
    )
  }

  const visiblePages = getVisiblePages(page, totalPages)

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <p className="text-muted-foreground text-sm">
        {t('paginationSummary', { page, totalPages, total })}
      </p>

      <nav
        className="flex flex-wrap items-center gap-1"
        aria-label={t('paginationNav')}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={t('prevPage')}
        >
          <ChevronLeft className="size-4" />
          {t('prevPage')}
        </Button>

        {visiblePages.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="text-muted-foreground px-2 text-sm"
              aria-hidden
            >
              …
            </span>
          ) : (
            <Button
              key={item}
              type="button"
              variant={item === page ? 'default' : 'outline'}
              size="sm"
              className="min-w-9"
              disabled={disabled}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          )
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label={t('nextPage')}
        >
          {t('nextPage')}
          <ChevronRight className="size-4" />
        </Button>
      </nav>
    </div>
  )
}
