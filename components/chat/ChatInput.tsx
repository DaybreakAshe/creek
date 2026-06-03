'use client'

import { useCallback, useLayoutEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowUp, ChevronDown, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { GeminiChatModelOption } from '@/lib/ai/gemini-models'

const INPUT_MIN_HEIGHT = 56
const INPUT_MAX_HEIGHT = 200

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onStop?: () => void
  status: 'submitted' | 'streaming' | 'ready' | 'error'
  disabled?: boolean
  models: GeminiChatModelOption[]
  modelId: string
  onModelChange: (modelId: string) => void
  modelsReady?: boolean
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  status,
  disabled,
  models,
  modelId,
  onModelChange,
  modelsReady = true,
}: ChatInputProps) {
  const t = useTranslations('chat')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isComposingRef = useRef(false)
  const isBusy = status === 'submitted' || status === 'streaming'
  const canSend = value.trim().length > 0 && !disabled && !isBusy
  const selectedModel = models.find((m) => m.id === modelId) ?? models[0]
  const modelLabel = selectedModel?.name ?? t('model')

  const resize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(Math.max(el.scrollHeight, INPUT_MIN_HEIGHT), INPUT_MAX_HEIGHT)}px`
  }, [])

  useLayoutEffect(() => {
    resize()
  }, [resize, value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    if (e.nativeEvent.isComposing || isComposingRef.current) return

    e.preventDefault()
    if (canSend) onSubmit()
  }

  return (
    <div className="p-3 backdrop-blur sm:p-4">
      <form
        className="bg-card border-input mx-auto flex max-w-3xl flex-col gap-2 rounded-2xl border p-2 shadow-sm"
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
          onCompositionStart={() => {
            isComposingRef.current = true
          }}
          onCompositionEnd={() => {
            isComposingRef.current = false
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            'placeholder:text-muted-foreground max-h-[200px] min-h-14 resize-none bg-transparent px-2 text-sm leading-6 outline-none transition-[height] duration-150 ease-out',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        />

        <div className="flex items-center justify-between gap-2 px-0.5 pb-0.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-8 gap-1 px-2 text-xs font-normal"
                disabled={!modelsReady || models.length === 0 || isBusy}
                aria-label={t('modelSelect')}
              >
                <span className="max-w-[10rem] truncate">{modelLabel}</span>
                <ChevronDown className="size-3.5 shrink-0 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[12rem]">
              <DropdownMenuLabel>{t('modelSelect')}</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={modelId} onValueChange={onModelChange}>
                {models.map((option) => (
                  <DropdownMenuRadioItem key={option.id} value={option.id}>
                    {option.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

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
        </div>
      </form>
    </div>
  )
}
