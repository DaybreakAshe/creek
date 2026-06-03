'use client'

import { useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowUp, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onStop?: () => void
  status: 'submitted' | 'streaming' | 'ready' | 'error'
  disabled?: boolean
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  status,
  disabled,
}: ChatInputProps) {
  const t = useTranslations('chat')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isBusy = status === 'submitted' || status === 'streaming'
  const canSend = value.trim().length > 0 && !disabled && !isBusy

  const resize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (canSend) onSubmit()
    }
  }

  return (
    <div className="border-border bg-background/80 border-t p-3 backdrop-blur sm:p-4">
      <form
        className="bg-card border-input mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border p-2 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault()
          if (canSend) onSubmit()
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          rows={1}
          disabled={disabled || isBusy}
          placeholder={t('inputPlaceholder')}
          onChange={(e) => {
            onChange(e.target.value)
            resize()
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            'placeholder:text-muted-foreground max-h-[200px] min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 text-sm outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        />
        {isBusy ? (
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-9 shrink-0 rounded-xl"
            onClick={onStop}
            aria-label={t('stop')}
          >
            <Square className="size-4 fill-current" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            className="size-9 shrink-0 rounded-xl"
            disabled={!canSend}
            aria-label={t('send')}
          >
            <ArrowUp className="size-4" />
          </Button>
        )}
      </form>
      <p className="text-muted-foreground mx-auto mt-2 max-w-3xl text-center text-xs">
        {t('disclaimer')}
      </p>
    </div>
  )
}
