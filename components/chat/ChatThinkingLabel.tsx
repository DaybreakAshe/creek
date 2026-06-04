'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface ChatThinkingLabelProps {
  className?: string
}

export function ChatThinkingLabel({ className }: ChatThinkingLabelProps) {
  const t = useTranslations('chat')
  const dot = '.'

  return (
    <p
      className={cn('text-muted-foreground text-xs', className)}
      aria-live="polite"
      aria-busy="true"
    >
      {t('thinking')}
      <span className="inline-flex w-[1.35em]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="animate-thinking-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            {dot}
          </span>
        ))}
      </span>
    </p>
  )
}
