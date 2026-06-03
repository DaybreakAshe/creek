'use client'

import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { Sparkles } from 'lucide-react'
import Threads from '@/components/Threads'
import { Button } from '@/components/ui/button'

interface ChatEmptyStateProps {
  onSelect: (text: string) => void
  className?: string
}

export function ChatEmptyState({ onSelect, className }: ChatEmptyStateProps) {
  const t = useTranslations('chat')
  const { data: session } = useSession()
  const { resolvedTheme } = useTheme()
  const userName = session?.user?.name?.trim().split(/\s+/)[0]
  const threadColor = useMemo<[number, number, number]>(
    () => (resolvedTheme === 'dark' ? [1, 1, 1] : [0.35, 0.35, 0.4]),
    [resolvedTheme]
  )

  const suggestions = [
    t('suggestions.intro'),
    t('suggestions.tools'),
    t('suggestions.gallery'),
    t('suggestions.creative'),
  ]

  return (
    <div className={`relative flex min-h-0 flex-1 flex-col ${className ?? ''}`.trim()}>
      <Threads
        aria-hidden
        className="absolute inset-0"
        color={threadColor}
        amplitude={1}
        distance={0.2}
      />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-2xl">
          <Sparkles className="size-7" />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">
            {userName ? t('emptyTitle', { name: userName }) : t('emptyTitleGuest')}
          </h1>
          <p className="text-muted-foreground text-sm">{t('emptyDescription')}</p>
        </div>
        <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
          {suggestions.map((text) => (
            <Button
              key={text}
              type="button"
              variant="outline"
              className="bg-background/55 border-border/60 h-auto min-h-10 justify-start px-3 py-2.5 text-left text-sm font-normal whitespace-normal backdrop-blur-md"
              onClick={() => onSelect(text)}
            >
              {text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
