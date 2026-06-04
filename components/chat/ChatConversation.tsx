'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { useTranslations } from 'next-intl'
import { getChatTransport, setChatRequestExtraBody } from '@/lib/chat/client-transport'
import type { useChatModel } from '@/hooks/use-chat-model'
import { AlertCircle } from 'lucide-react'
import type { UIMessage } from '@/lib/chat/types'
import { useChatMessages } from '@/hooks/use-chat-messages'
import { chatMessagesColumnClass } from '@/components/chat/chat-layout'
import { ChatMessageList } from '@/components/chat/ChatMessageList'
import { ChatInput } from '@/components/chat/ChatInput'
import { Button } from '@/components/ui/button'

const EMPTY_MESSAGES: UIMessage[] = []

type ChatModelState = Pick<
  ReturnType<typeof useChatModel>,
  'models' | 'modelId' | 'selectModel' | 'ready'
>

interface ChatConversationProps {
  chatId: string
  /** 仅在为 true 时从服务端拉历史（侧栏点选或直链 /chat/{id}） */
  loadHistoryFromServer?: boolean
  onMessagesPersist: (chatId: string, messages: UIMessage[]) => void
  chatModel: ChatModelState
}

interface ChatConversationInnerProps {
  chatId: string
  initialMessages: UIMessage[]
  onMessagesPersist: (chatId: string, messages: UIMessage[]) => void
  hasEarlierMessages: boolean
  loadingEarlier: boolean
  onLoadEarlier: () => void
  chatModel: ChatModelState
}

function ChatConversationInner({
  chatId,
  initialMessages,
  onMessagesPersist,
  hasEarlierMessages,
  loadingEarlier,
  onLoadEarlier,
  chatModel,
}: ChatConversationInnerProps) {
  const t = useTranslations('chat')
  const [input, setInput] = useState('')
  const skipInitialPersistRef = useRef(true)
  const initialMessagesRef = useRef(initialMessages)
  initialMessagesRef.current = initialMessages
  const { models, modelId, selectModel, ready: modelsReady } = chatModel

  const { messages, sendMessage, status, stop, regenerate, error, clearError } =
    useChat({
      id: chatId,
      messages: initialMessages,
      transport: getChatTransport(),
    })

  useEffect(() => {
    setChatRequestExtraBody({ model: modelId })
  }, [modelId])

  useEffect(() => {
    skipInitialPersistRef.current = true
  }, [chatId])

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

  useEffect(() => {
    if (messages.length === 0) return

    if (skipInitialPersistRef.current) {
      skipInitialPersistRef.current = false
      const initial = initialMessagesRef.current
      if (
        messages.length === initial.length &&
        messages.every(
          (m, i) =>
            m.id === initial[i]?.id &&
            JSON.stringify(m.parts) === JSON.stringify(initial[i]?.parts)
        )
      ) {
        return
      }
    }

    const timer = window.setTimeout(() => {
      onMessagesPersist(chatId, messages)
    }, 400)

    return () => window.clearTimeout(timer)
  }, [chatId, messages, onMessagesPersist])

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {error && (
        <div
          className={chatMessagesColumnClass(
            'border-destructive/30 bg-destructive/10 text-destructive mt-3 flex shrink-0 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm'
          )}
        >
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
        chatId={chatId}
        className="min-h-0 flex-1"
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
        models={models}
        modelId={modelId}
        onModelChange={selectModel}
        modelsReady={modelsReady}
      />
    </div>
  )
}

/** 新对话 /chat：不挂载 useChatMessages，消息仅存在 useChat 本地 */
function ChatConversationLocal({
  chatId,
  onMessagesPersist,
  chatModel,
}: Omit<ChatConversationProps, 'loadHistoryFromServer'>) {
  return (
    <ChatConversationInner
      chatId={chatId}
      initialMessages={EMPTY_MESSAGES}
      onMessagesPersist={onMessagesPersist}
      hasEarlierMessages={false}
      loadingEarlier={false}
      onLoadEarlier={() => {}}
      chatModel={chatModel}
    />
  )
}

function ChatConversationWithHistory({
  chatId,
  onMessagesPersist,
  chatModel,
}: Omit<ChatConversationProps, 'loadHistoryFromServer'>) {
  const t = useTranslations('chat')

  const {
    messages: loadedMessages,
    loading: messagesLoading,
    loadingEarlier,
    hasEarlierMessages,
    loadEarlierMessages,
    error: messagesError,
  } = useChatMessages(chatId)

  if (messagesError) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center px-4 text-center text-sm">
        {t('errorGeneric')}
      </div>
    )
  }

  if (messagesLoading) {
    return (
      <div className="text-muted-foreground flex min-h-0 flex-1 items-center justify-center text-sm">
        {t('loading')}
      </div>
    )
  }

  return (
    <ChatConversationInner
      chatId={chatId}
      initialMessages={loadedMessages}
      onMessagesPersist={onMessagesPersist}
      hasEarlierMessages={hasEarlierMessages}
      loadingEarlier={loadingEarlier}
      onLoadEarlier={() => void loadEarlierMessages()}
      chatModel={chatModel}
    />
  )
}

export function ChatConversation({
  chatId,
  loadHistoryFromServer = false,
  onMessagesPersist,
  chatModel,
}: ChatConversationProps) {
  if (!loadHistoryFromServer) {
    return (
      <ChatConversationLocal
        chatId={chatId}
        onMessagesPersist={onMessagesPersist}
        chatModel={chatModel}
      />
    )
  }

  return (
    <ChatConversationWithHistory
      chatId={chatId}
      onMessagesPersist={onMessagesPersist}
      chatModel={chatModel}
    />
  )
}
