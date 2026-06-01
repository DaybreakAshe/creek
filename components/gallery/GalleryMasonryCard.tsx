/* eslint-disable @next/next/no-img-element */
'use client'

import { FileText, Music } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { GalleryItemRecord } from '@/lib/gallery-types'

interface GalleryMasonryCardProps {
  item: GalleryItemRecord
}

export function GalleryMasonryCard({ item }: GalleryMasonryCardProps) {
  const t = useTranslations('home.gallery')
  const href = item.linkUrl?.trim() || item.mediaUrl
  const openInNewTab = Boolean(href)

  const media = renderMedia(item, t('previewAlt'))
  const body = (
    <article className="border-border bg-card group overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md">
      <div className="relative">
        {media}
        <span className="bg-background/80 text-muted-foreground absolute top-2 right-2 rounded-md px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
          {t(`types.${item.type}`)}
        </span>
      </div>
      <div className="space-y-1.5 p-3">
        <h3 className="line-clamp-2 text-sm leading-snug font-medium">
          {item.title}
        </h3>
        {item.description ? (
          <p className="text-muted-foreground line-clamp-2 text-xs">
            {item.description}
          </p>
        ) : null}
        {item.tags && item.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )

  if (openInNewTab) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-4 block focus-visible:ring-ring rounded-xl outline-none focus-visible:ring-2"
      >
        {body}
      </a>
    )
  }

  return <div className="mb-4">{body}</div>
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
          className="w-full object-cover"
        />
      )
    case 'video':
      return (
        <div className="bg-muted aspect-video w-full">
          <video
            src={item.mediaUrl}
            controls
            playsInline
            preload="metadata"
            className="size-full object-cover"
          />
        </div>
      )
    case 'audio':
      return (
        <div className="bg-muted flex flex-col items-center gap-3 px-4 py-8">
          <Music className="text-muted-foreground size-10" />
          <audio
            src={item.mediaUrl}
            controls
            preload="metadata"
            className="w-full max-w-full"
          />
        </div>
      )
    case 'document':
    default:
      return (
        <div
          className={cn(
            'bg-muted flex flex-col items-center justify-center gap-2 px-4 py-10',
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
