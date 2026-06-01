'use client'

import useSWR from 'swr'
import Masonry from 'react-masonry-css'
import { useTranslations } from 'next-intl'
import { getApiErrorMessage } from '@/lib/api-error'
import type { GalleryItemRecord } from '@/lib/gallery-types'
import { GalleryMasonryCard } from '@/components/gallery/GalleryMasonryCard'
import { Skeleton } from '@/components/ui/skeleton'

const MASONRY_BREAKPOINTS = {
  default: 3,
  768: 2,
  480: 1,
}

const SKELETON_COUNT = 9

async function fetchGallery(): Promise<GalleryItemRecord[]> {
  const response = await fetch('/api/gallery')
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const code = typeof data.error === 'string' ? data.error : undefined
    throw new Error(code ?? 'fetchGalleryFailed')
  }
  return data as GalleryItemRecord[]
}

function GallerySkeletonGrid() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <Skeleton key={i} className="aspect-[4/3] w-full rounded-xl" />
      ))}
    </div>
  )
}

interface GalleryMasonryProps {
  refreshToken?: number
}

export function GalleryMasonry({ refreshToken = 0 }: GalleryMasonryProps) {
  const t = useTranslations('home')
  const tErrors = useTranslations('errors')

  const { data, error, isLoading } = useSWR(
    ['/api/gallery', refreshToken],
    fetchGallery,
    { revalidateOnFocus: true }
  )

  if (isLoading) {
    return (
      <section aria-label={t('galleryLoading')} aria-busy="true">
        <GallerySkeletonGrid />
      </section>
    )
  }

  if (error) {
    return (
      <p className="text-destructive py-8 text-center text-sm" role="alert">
        {getApiErrorMessage(
          tErrors,
          error instanceof Error ? error.message : undefined,
          'fetchGalleryFailed'
        )}
      </p>
    )
  }

  const items = data ?? []

  if (items.length === 0) {
    return (
      <section
        className="border-border bg-muted/30 flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center"
        aria-label={t('galleryEmpty')}
      >
        <p className="text-muted-foreground text-sm">{t('galleryEmpty')}</p>
      </section>
    )
  }

  return (
    <section aria-label={t('gallerySection')}>
      <Masonry
        breakpointCols={MASONRY_BREAKPOINTS}
        className="gallery-masonry-grid"
        columnClassName="gallery-masonry-grid_column"
      >
        {items.map((item) => (
          <GalleryMasonryCard
            key={item._id ?? item.mediaUrl}
            item={item}
          />
        ))}
      </Masonry>
    </section>
  )
}
