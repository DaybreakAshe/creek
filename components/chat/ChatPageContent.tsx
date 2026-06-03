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

export function ChatPageContent() {
  const t = useTranslations('chat')
  const { data: session, status: authStatus } = useSession()
  const userId = session?.user?.id
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const {
    sessions,
    activeId,
    activeSession,
    hydrated,
    createSession,
    selectSession,
    deleteSession,
    saveMessages,
  } = useChatSessions(userId, t('newChatTitle'))

  useEffect(() => {
    if (!hydrated || !userId) return

    if (sessions.length === 0) {
      createSession()
      return
    }

    if (!activeId || !sessions.some((s) => s.id === activeId)) {
      selectSession(sessions[0].id)
    }
  }, [hydrated, userId, sessions, activeId, createSession, selectSession])

  const handleNewChat = useCallback(() => {
    createSession()
    setSidebarOpen(false)
  }, [createSession])

  const handleSelectSession = useCallback(
    (id: string) => {
      selectSession(id)
      setSidebarOpen(false)
    },
    [selectSession]
  )

  const handleDeleteSession = useCallback(
    (id: string) => {
      deleteSession(id)
    },
    [deleteSession]
  )

  const handlePersist = useCallback(
    (chatId: string, messages: Parameters<typeof saveMessages>[1]) => {
      saveMessages(chatId, messages)
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

  if (!activeId) {
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
          key={activeId}
          chatId={activeId}
          initialMessages={activeSession?.messages ?? []}
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
