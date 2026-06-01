/* eslint-disable @next/next/no-img-element */
'use client'

import { Hammer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { canDisplayToolIcon } from '@/lib/tool-icon'

type ToolIconSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<
  ToolIconSize,
  { box: string; icon: string; image: string }
> = {
  sm: { box: 'size-10 rounded-xl', icon: 'size-4', image: 'size-10 rounded-xl' },
  md: { box: 'size-12 rounded-xl', icon: 'size-5', image: 'size-12 rounded-xl' },
  lg: { box: 'size-16 rounded-2xl', icon: 'size-7', image: 'size-16 rounded-2xl' },
}

interface ToolIconProps {
  icon?: string | null
  name?: string
  size?: ToolIconSize
  className?: string
}

export function ToolIcon({
  icon,
  name = '',
  size = 'md',
  className,
}: ToolIconProps) {
  const sizes = sizeClasses[size]

  if (canDisplayToolIcon(icon)) {
    return (
      <img
        src={icon!.trim()}
        alt={name ? `${name} icon` : ''}
        className={cn(
          'bg-muted object-cover ring-1 ring-black/5 dark:ring-white/10',
          sizes.image,
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'bg-muted/80 text-muted-foreground flex items-center justify-center ring-1 ring-black/5 dark:ring-white/10',
        sizes.box,
        className
      )}
      aria-hidden={!name}
    >
      <Hammer className={sizes.icon} strokeWidth={1.5} />
    </div>
  )
}
