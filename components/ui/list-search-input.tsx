'use client'

import { Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ListSearchInputProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  onCompositionStart?: () => void
  onCompositionEnd?: (e: React.CompositionEvent<HTMLInputElement>) => void
  showSpinner?: boolean
  className?: string
  disabled?: boolean
}

export function ListSearchInput({
  placeholder,
  value,
  onChange,
  onCompositionStart,
  onCompositionEnd,
  showSpinner = false,
  className,
  disabled,
}: ListSearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        disabled={disabled}
        className={cn('pl-9', showSpinner && 'pr-9')}
        aria-busy={showSpinner}
      />
      {showSpinner && (
        <Loader2
          className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin"
          aria-hidden
        />
      )}
    </div>
  )
}
