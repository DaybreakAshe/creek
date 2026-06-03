'use client'

import { useCallback, useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { useTranslations } from 'next-intl'
import { AlertCircle } from 'lucide-react'
import type { UIMessage } from 'ai'
import { chatTransport } from '@/lib/chat/transport'
import { ChatMessageList } from '@/components/chat/ChatMessageList'
import { ChatInput } from '@/components/chat/ChatInput'
import { Button } from '@/components/ui/button'

interface ChatConversationProps {
  chatId: string
  initialMessages: UIMessage[]
  onMessagesPersist: (chatId: string, messages: UIMessage[]) => void
}

export function ChatConversation({
  chatId,
  initialMessages,
  onMessagesPersist,
}: ChatConversationProps) {
  const t = useTranslations('chat')
  const [input, setInput] = useState('')

  const { messages, sendMessage, status, stop, regenerate, error, clearError } =
    useChat({
      id: chatId,
      messages: initialMessages,
      transport: chatTransport,
    })

  const handleSubmit = useCallback(async () => {
    const text = input.trim()
    if (!text || status === 'submitted' || status === 'streaming') return

    setInput('')
    await sendMessage({ text })
  }, [input, sendMessage, status])

  const handleSuggestion = useCallback(
    async (text: string) => {
      if (status === 'submitted' || status === 'streaming') return
      await sendMessage({ text })
    },
    [sendMessage, status]
  )

  useEffect(() => {
    if (messages.length > 0) {
      onMessagesPersist(chatId, messages)
    }
  }, [chatId, messages, onMessagesPersist])

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive mx-4 mt-3 flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
          <span className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            {t('errorGeneric')}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={clearError}>
            {t('dismiss')}
          </Button>
        </div>
      )}

      <ChatMessageList
        messages={messages}
        status={status}
        onSuggestionSelect={handleSuggestion}
        onRegenerate={() => regenerate()}
      />

      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={() => void handleSubmit()}
        onStop={stop}
        status={status}
      />
    </div>
  )
}
