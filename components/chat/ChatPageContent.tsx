'use client'

import { useCallback, useEffect, useState } from 'react'
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
  const [sessionReady, setSessionReady] = useState(false)

  const {
    sessions,
    pagination,
    hydrated,
    loadingMore,
    loadMoreSessions,
    createSession,
    deleteSession,
    saveMessages,
    ensureSession,
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

    let cancelled = false

    const resolveSession = async () => {
      const exists = sessions.some((s) => s.id === chatId)
      if (exists) {
        if (!cancelled) setSessionReady(true)
        return
      }

      const ok = await ensureSession(chatId)
      if (cancelled) return

      if (ok) {
        setSessionReady(true)
        return
      }

      if (sessions.length === 0) {
        const id = await createSession()
        router.replace(`/chat/${id}`)
        return
      }

      router.replace(`/chat/${sessions[0].id}`)
    }

    setSessionReady(false)
    void resolveSession()

    return () => {
      cancelled = true
    }
  }, [
    hydrated,
    userId,
    chatId,
    sessions,
    ensureSession,
    createSession,
    router,
  ])

  const handleNewChat = useCallback(async () => {
    const empty = sessions.find((s) => s.messageCount === 0)
    const id = empty ? empty.id : await createSession()
    setSidebarOpen(false)
    navigateToChat(id, { replace: true })
  }, [sessions, createSession, navigateToChat])

  const handleSelectSession = useCallback(
    (id: string) => {
      setSidebarOpen(false)
      navigateToChat(id, { replace: true })
    },
    [navigateToChat]
  )

  const handleDeleteSession = useCallback(
    async (id: string) => {
      const wasActive = id === chatId
      const remaining = sessions.filter((s) => s.id !== id)
      await deleteSession(id)

      if (!wasActive) return

      const empty = remaining.find((s) => s.messageCount === 0)
      if (empty) {
        navigateToChat(empty.id, { replace: true })
        return
      }

      if (remaining[0]) {
        navigateToChat(remaining[0].id, { replace: true })
        return
      }

      const newId = await createSession()
      navigateToChat(newId, { replace: true })
    },
    [chatId, sessions, deleteSession, navigateToChat, createSession]
  )

  const handlePersist = useCallback(
    (persistChatId: string, messages: Parameters<typeof saveMessages>[1]) => {
      void saveMessages(persistChatId, messages)
    },
    [saveMessages]
  )

  const sidebarProps = {
    sessions,
    activeId: chatId,
    onNewChat: () => void handleNewChat(),
    onSelect: handleSelectSession,
    onDelete: handleDeleteSession,
    hasMore: pagination.hasMore,
    loadingMore,
    onLoadMore: () => void loadMoreSessions(),
  }

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

  if (!sessionReady) {
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
      <ChatSidebar {...sidebarProps} className="hidden md:flex" />

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
          onMessagesPersist={handlePersist}
        />
      </div>

      <Dialog open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <DialogContent className="flex h-[85dvh] max-w-sm flex-col gap-0 overflow-hidden p-0 sm:max-w-sm">
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle>{t('history')}</DialogTitle>
          </DialogHeader>
          <ChatSidebar
            {...sidebarProps}
            onClose={() => setSidebarOpen(false)}
            className="flex flex-1 border-0"
          />
        </DialogContent>
      </Dialog>
    </ChatPageShell>
  )
}
