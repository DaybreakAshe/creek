export function ChatTypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      <span className="bg-foreground/70 size-2 animate-pulse rounded-full" />
      <span className="bg-foreground/50 size-2 animate-pulse rounded-full [animation-delay:150ms]" />
      <span className="bg-foreground/30 size-2 animate-pulse rounded-full [animation-delay:300ms]" />
    </span>
  )
}
