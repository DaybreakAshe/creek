/* eslint-disable @next/next/no-img-element */
'use client'

import { FileText, Music, Play } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { GalleryItemRecord } from '@/lib/gallery-types'

interface GalleryMasonryCardProps {
  item: GalleryItemRecord
}

export function GalleryMasonryCard({ item }: GalleryMasonryCardProps) {
  const t = useTranslations('home.gallery')
  const href = item.linkUrl?.trim() || item.mediaUrl

  const body = (
    <article className="group bg-muted relative overflow-hidden rounded-xl">
      <div className="relative overflow-hidden rounded-xl">
        {renderMedia(item, t('previewAlt'))}
        {item.type === 'video' && (
          <span
            className="pointer-events-none absolute top-2.5 left-2.5 flex size-9 items-center justify-center rounded-full bg-black/45 text-white shadow-sm backdrop-blur-sm"
            aria-hidden
          >
            <Play className="size-4 fill-current pl-0.5" />
          </span>
        )}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
          aria-hidden
        />
        <h3 className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 px-3 py-3 text-sm font-medium text-white opacity-0 drop-shadow-md transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          {item.title}
        </h3>
      </div>
    </article>
  )

  const className =
    'block overflow-hidden rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none'

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {body}
      </a>
    )
  }

  return <div className={className}>{body}</div>
}

function renderMedia(item: GalleryItemRecord, fallbackAlt: string) {
  const alt = item.altText?.trim() || item.title || fallbackAlt

  switch (item.type) {
    case 'image':
      return (
        <img
          src={item.mediaUrl}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="block w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      )
    case 'video':
      return (
        <video
          src={item.mediaUrl}
          playsInline
          muted
          preload="metadata"
          className="block w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      )
    case 'audio':
      return (
        <div className="flex flex-col items-center gap-3 px-4 py-10">
          <Music className="text-muted-foreground size-10" />
          <audio
            src={item.mediaUrl}
            controls
            preload="metadata"
            className="relative z-10 w-full max-w-full"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )
    case 'document':
    default:
      return (
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-2 px-4 py-12',
            'text-muted-foreground'
          )}
        >
          <FileText className="size-12 opacity-70" />
          <span className="max-w-full truncate px-2 text-xs">
            {item.mediaFilename?.split('/').pop() || item.title}
          </span>
        </div>
      )
  }
}
