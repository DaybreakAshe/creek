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
import { useChatSessionsContext } from '@/components/chat/ChatSessionsProvider'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { ChatConversation } from '@/components/chat/ChatConversation'
import { useChatModel } from '@/hooks/use-chat-model'
import { ChatLoginGate } from '@/components/chat/ChatLoginGate'
import type { UIMessage } from '@/lib/chat/types'

function ChatPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex h-full min-h-0 w-full overflow-hidden">
      {children}
    </div>
  )
}

function createDraftChatId() {
  return crypto.randomUUID()
}

interface ChatPageContentProps {
  /** 路由中的会话 id；省略表示新对话（地址栏保持 /chat） */
  chatId?: string
}

export function ChatPageContent({ chatId: routeChatId }: ChatPageContentProps) {
  const t = useTranslations('chat')
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()
  const userId = session?.user?.id
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [draftChatId, setDraftChatId] = useState(createDraftChatId)
  const sessionCreatedRef = useRef(false)
  const invalidRouteRef = useRef(false)

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
  } = useChatSessionsContext()

  const chatModel = useChatModel()
  const isDraft = !routeChatId
  const activeChatId = routeChatId ?? draftChatId

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

  /** 直链打开 /chat/{id} 时后台校验会话是否存在 */
  useEffect(() => {
    if (!hydrated || !userId || !routeChatId || routeChatId === 'new') return
    if (sessions.some((s) => s.id === routeChatId)) return
    if (invalidRouteRef.current) return

    let cancelled = false

    void (async () => {
      const ok = await ensureSession(routeChatId)
      if (cancelled) return
      if (!ok) {
        invalidRouteRef.current = true
        router.replace('/chat')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [hydrated, userId, routeChatId, sessions, ensureSession, router])

  const handleNewChat = useCallback(() => {
    setSidebarOpen(false)
    setDraftChatId(createDraftChatId())
    sessionCreatedRef.current = false
    if (!isDraft) {
      router.replace('/chat')
    }
  }, [isDraft, router])

  const handleSelectSession = useCallback(
    (id: string) => {
      if (id !== routeChatId) {
        navigateToChat(id, { replace: true })
      }
      setSidebarOpen(false)
    },
    [routeChatId, navigateToChat]
  )

  const handleDeleteSession = useCallback(
    async (id: string) => {
      const wasActive = id === routeChatId || (isDraft && id === activeChatId)
      const remaining = sessions.filter((s) => s.id !== id)
      await deleteSession(id)

      if (!wasActive) return

      if (isDraft) {
        setDraftChatId(createDraftChatId())
        sessionCreatedRef.current = false
        return
      }

      if (remaining[0]) {
        navigateToChat(remaining[0].id, { replace: true })
        return
      }

      router.replace('/chat')
    },
    [routeChatId, isDraft, activeChatId, sessions, deleteSession, navigateToChat, router]
  )

  const handlePersist = useCallback(
    async (persistChatId: string, messages: UIMessage[]) => {
      if (messages.length === 0) return

      if (isDraft && !sessionCreatedRef.current) {
        sessionCreatedRef.current = true
        await createSession(persistChatId)
      }

      await saveMessages(persistChatId, messages)
    },
    [isDraft, createSession, saveMessages]
  )

  const sidebarProps = {
    sessions,
    activeId: routeChatId ?? null,
    sessionsLoading: Boolean(userId && !hydrated),
    onNewChat: () => void handleNewChat(),
    onSelect: handleSelectSession,
    onDelete: handleDeleteSession,
    hasMore: pagination.hasMore,
    loadingMore,
    onLoadMore: () => void loadMoreSessions(),
  }

  if (authStatus === 'loading') {
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
          key={routeChatId ?? draftChatId}
          chatId={activeChatId}
          loadHistoryFromServer={Boolean(routeChatId)}
          onMessagesPersist={handlePersist}
          chatModel={chatModel}
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
