'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRouter } from '@/i18n/navigation'
import { useChatSessions } from '@/hooks/use-chat-sessions'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { ChatConversation } from '@/components/chat/ChatConversation'
import { ChatLoginGate } from '@/components/chat/ChatLoginGate'

function ChatPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex h-full min-h-0 w-full overflow-hidden">
      {children}
    </div>
  )
}

interface ChatPageContentProps {
  chatId: string
}

export function ChatPageContent({ chatId }: ChatPageContentProps) {
  const t = useTranslations('chat')
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()
  const userId = session?.user?.id
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const syncingFromUrl = useRef(false)

  const {
    sessions,
    activeId,
    hydrated,
    createSession,
    selectSession,
    deleteSession,
    saveMessages,
  } = useChatSessions(userId, t('newChatTitle'))

  const navigateToChat = useCallback(
    (id: string, options?: { replace?: boolean }) => {
      const href = `/chat/${id}` as const
      if (options?.replace) {
        router.replace(href)
      } else {
        router.push(href)
      }
    },
    [router]
  )

  useEffect(() => {
    if (!hydrated) return

    if (!userId) {
      if (chatId !== 'new') {
        router.replace('/chat/new')
      }
      return
    }

    if (chatId === 'new') {
      router.replace('/chat')
      return
    }

    const exists = sessions.some((s) => s.id === chatId)

    if (exists) {
      if (activeId !== chatId) {
        syncingFromUrl.current = true
        selectSession(chatId)
      }
      return
    }

    if (sessions.length === 0) {
      const id = createSession()
      router.replace(`/chat/${id}`)
      return
    }

    const fallbackId =
      activeId && sessions.some((s) => s.id === activeId)
        ? activeId
        : sessions[0].id
    router.replace(`/chat/${fallbackId}`)
  }, [
    hydrated,
    userId,
    chatId,
    sessions,
    activeId,
    selectSession,
    createSession,
    router,
  ])

  useEffect(() => {
    if (!hydrated || !userId || !activeId) return
    if (syncingFromUrl.current) {
      syncingFromUrl.current = false
      return
    }
    if (chatId === activeId) return
    navigateToChat(activeId, { replace: true })
  }, [hydrated, userId, activeId, chatId, navigateToChat])

  const handleNewChat = useCallback(() => {
    const id = createSession()
    setSidebarOpen(false)
    navigateToChat(id, { replace: true })
  }, [createSession, navigateToChat])

  const handleSelectSession = useCallback(
    (id: string) => {
      selectSession(id)
      setSidebarOpen(false)
      navigateToChat(id, { replace: true })
    },
    [selectSession, navigateToChat]
  )

  const handleDeleteSession = useCallback(
    (id: string) => {
      const wasActive = id === activeId
      const remaining = sessions.filter((s) => s.id !== id)
      deleteSession(id)
      if (!wasActive) return

      const nextId = remaining[0]?.id
      if (nextId) {
        navigateToChat(nextId, { replace: true })
      } else {
        const newId = createSession()
        navigateToChat(newId, { replace: true })
      }
    },
    [deleteSession, activeId, sessions, navigateToChat, createSession]
  )

  const handlePersist = useCallback(
    (persistChatId: string, messages: Parameters<typeof saveMessages>[1]) => {
      saveMessages(persistChatId, messages)
    },
    [saveMessages]
  )

  if (authStatus === 'loading' || (userId && !hydrated)) {
    return (
      <ChatPageShell>
        <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
          {t('loading')}
        </div>
      </ChatPageShell>
    )
  }

  if (!userId) {
    return (
      <ChatPageShell>
        <ChatLoginGate />
      </ChatPageShell>
    )
  }

  const resolvedSession = sessions.find((s) => s.id === chatId)
  const showConversation =
    chatId && resolvedSession && activeId === chatId

  if (!showConversation) {
    return (
      <ChatPageShell>
        <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
          {t('loading')}
        </div>
      </ChatPageShell>
    )
  }

  return (
    <ChatPageShell>
      <ChatSidebar
        sessions={sessions}
        activeId={activeId}
        onNewChat={handleNewChat}
        onSelect={handleSelectSession}
        onDelete={handleDeleteSession}
        className="hidden md:flex"
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="border-border flex shrink-0 items-center justify-end border-b px-3 py-2 md:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setSidebarOpen(true)}
          >
            <History className="size-4" />
            {t('history')}
          </Button>
        </div>

        <ChatConversation
          key={chatId}
          chatId={chatId}
          initialMessages={resolvedSession.messages}
          onMessagesPersist={handlePersist}
        />
      </div>

      <Dialog open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <DialogContent className="flex h-[85dvh] max-w-sm flex-col gap-0 overflow-hidden p-0 sm:max-w-sm">
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle>{t('history')}</DialogTitle>
          </DialogHeader>
          <ChatSidebar
            sessions={sessions}
            activeId={activeId}
            onNewChat={handleNewChat}
            onSelect={handleSelectSession}
            onDelete={handleDeleteSession}
            onClose={() => setSidebarOpen(false)}
            className="flex flex-1 border-0"
          />
        </DialogContent>
      </Dialog>
    </ChatPageShell>
  )
}
