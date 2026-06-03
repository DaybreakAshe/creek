'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { useTranslations } from 'next-intl'
import { getChatTransport } from '@/lib/chat/client-transport'
import { AlertCircle } from 'lucide-react'
import type { UIMessage } from '@/lib/chat/types'
import { useChatMessages } from '@/hooks/use-chat-messages'
import { ChatMessageList } from '@/components/chat/ChatMessageList'
import { ChatInput } from '@/components/chat/ChatInput'
import { Button } from '@/components/ui/button'

interface ChatConversationProps {
  chatId: string
  onMessagesPersist: (chatId: string, messages: UIMessage[]) => void
}

interface ChatConversationInnerProps {
  chatId: string
  initialMessages: UIMessage[]
  onMessagesPersist: (chatId: string, messages: UIMessage[]) => void
  hasEarlierMessages: boolean
  loadingEarlier: boolean
  onLoadEarlier: () => void
}

/** 等历史消息加载完成后再挂载 useChat，避免用空数组初始化后无法显示已拉取的消息。 */
function ChatConversationInner({
  chatId,
  initialMessages,
  onMessagesPersist,
  hasEarlierMessages,
  loadingEarlier,
  onLoadEarlier,
}: ChatConversationInnerProps) {
  const t = useTranslations('chat')
  const [input, setInput] = useState('')

  const { messages, sendMessage, status, stop, regenerate, error, clearError } =
    useChat({
      id: chatId,
      messages: initialMessages,
      transport: getChatTransport(),
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

  const handleRegenerate = useCallback(() => {
    regenerate()
  }, [regenerate])

  const skipInitialPersistRef = useRef(true)

  useEffect(() => {
    if (messages.length === 0) return

    if (skipInitialPersistRef.current) {
      skipInitialPersistRef.current = false
      if (
        messages.length === initialMessages.length &&
        messages.every(
          (m, i) =>
            m.id === initialMessages[i]?.id &&
            JSON.stringify(m.parts) === JSON.stringify(initialMessages[i]?.parts)
        )
      ) {
        return
      }
    }

    const timer = window.setTimeout(() => {
      onMessagesPersist(chatId, messages)
    }, 400)

    return () => window.clearTimeout(timer)
  }, [chatId, initialMessages, messages, onMessagesPersist])

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive mx-4 mt-3 flex shrink-0 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
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
        onRegenerate={handleRegenerate}
        hasEarlierMessages={hasEarlierMessages}
        loadingEarlier={loadingEarlier}
        onLoadEarlier={onLoadEarlier}
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

export function ChatConversation({
  chatId,
  onMessagesPersist,
}: ChatConversationProps) {
  const t = useTranslations('chat')

  const {
    messages: loadedMessages,
    loading: messagesLoading,
    loadingEarlier,
    hasEarlierMessages,
    loadEarlierMessages,
    error: messagesError,
  } = useChatMessages(chatId)

  if (messagesLoading) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
        {t('loading')}
      </div>
    )
  }

  if (messagesError) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center px-4 text-center text-sm">
        {t('errorGeneric')}
      </div>
    )
  }

  return (
    <ChatConversationInner
      key={chatId}
      chatId={chatId}
      initialMessages={loadedMessages}
      onMessagesPersist={onMessagesPersist}
      hasEarlierMessages={hasEarlierMessages}
      loadingEarlier={loadingEarlier}
      onLoadEarlier={() => void loadEarlierMessages()}
    />
  )
}
