/* eslint-disable @next/next/no-img-element */
'use client'

import { Hammer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { canDisplayToolIcon } from '@/lib/tool-icon'

type ToolIconSize = 'sm' | 'md' | 'lg'
type ToolIconVariant = 'default' | 'plain'

const sizeClasses: Record<
  ToolIconSize,
  { box: string; icon: string; image: string }
> = {
  sm: { box: 'size-10 rounded-xl', icon: 'size-4', image: 'size-10 rounded-xl' },
  md: { box: 'size-12 rounded-xl', icon: 'size-5', image: 'size-12 rounded-xl' },
  lg: { box: 'size-16 rounded-2xl', icon: 'size-7', image: 'size-16 rounded-2xl' },
}

const variantClasses: Record<
  ToolIconVariant,
  { image: string; fallback: string }
> = {
  default: {
    image: 'bg-muted object-cover ring-1 ring-black/5 dark:ring-white/10',
    fallback:
      'bg-muted/80 text-muted-foreground ring-1 ring-black/5 dark:ring-white/10',
  },
  plain: {
    image:
      'object-contain shadow-sm shadow-black/10 dark:shadow-black/30',
    fallback: 'bg-transparent text-muted-foreground shadow-none ring-0',
  },
}

interface ToolIconProps {
  icon?: string | null
  name?: string
  size?: ToolIconSize
  /** plain：无底色，适合卡片列表 */
  variant?: ToolIconVariant
  className?: string
}

export function ToolIcon({
  icon,
  name = '',
  size = 'md',
  variant = 'default',
  className,
}: ToolIconProps) {
  const sizes = sizeClasses[size]
  const styles = variantClasses[variant]

  if (canDisplayToolIcon(icon)) {
    return (
      <img
        src={icon!.trim()}
        alt={name ? `${name} icon` : ''}
        className={cn(styles.image, sizes.image, className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        styles.fallback,
        sizes.box,
        className
      )}
      aria-hidden={!name}
    >
      <Hammer className={sizes.icon} strokeWidth={1.5} />
    </div>
  )
}
