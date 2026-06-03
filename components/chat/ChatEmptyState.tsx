'use client'

import { useTranslations } from 'next-intl'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatEmptyStateProps {
  onSelect: (text: string) => void
}

export function ChatEmptyState({ onSelect }: ChatEmptyStateProps) {
  const t = useTranslations('chat')

  const suggestions = [
    t('suggestions.intro'),
    t('suggestions.tools'),
    t('suggestions.gallery'),
    t('suggestions.creative'),
  ]

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-2xl">
        <Sparkles className="size-7" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">{t('emptyTitle')}</h2>
        <p className="text-muted-foreground text-sm">{t('emptyDescription')}</p>
      </div>
      <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
        {suggestions.map((text) => (
          <Button
            key={text}
            type="button"
            variant="outline"
            className="h-auto min-h-10 justify-start px-3 py-2.5 text-left text-sm font-normal whitespace-normal"
            onClick={() => onSelect(text)}
          >
            {text}
          </Button>
        ))}
      </div>
    </div>
  )
}
