'use client'

import { createContext, useContext } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useChatSessions } from '@/hooks/use-chat-sessions'

type ChatSessionsContextValue = ReturnType<typeof useChatSessions>

const ChatSessionsContext = createContext<ChatSessionsContextValue | null>(null)

export function ChatSessionsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const t = useTranslations('chat')
  const { data: session } = useSession()
  const value = useChatSessions(session?.user?.id, t('newChatTitle'))

  return (
    <ChatSessionsContext.Provider value={value}>
      {children}
    </ChatSessionsContext.Provider>
  )
}

export function useChatSessionsContext() {
  const context = useContext(ChatSessionsContext)
  if (!context) {
    throw new Error('useChatSessionsContext must be used within ChatSessionsProvider')
  }
  return context
}
