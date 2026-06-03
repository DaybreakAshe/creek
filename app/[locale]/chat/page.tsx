import { Suspense } from 'react'
import { ChatPageRedirect } from '@/components/chat/ChatPageRedirect'

function ChatLoadingFallback() {
  return (
    <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
      ...
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatLoadingFallback />}>
      <ChatPageRedirect />
    </Suspense>
  )
}
