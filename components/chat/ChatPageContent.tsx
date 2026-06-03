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
  /** 路由中的会话 id；省略表示新对话草稿（地址栏为 /chat） */
  chatId?: string
}

export function ChatPageContent({ chatId: routeChatId }: ChatPageContentProps) {
  const t = useTranslations('chat')
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()
  const userId = session?.user?.id
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [promotedDraftId, setPromotedDraftId] = useState<string | null>(null)
  const invalidRouteRef = useRef(false)
  const draftIdRef = useRef(createDraftChatId())

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

  const isDraft = !routeChatId
  const activeChatId = routeChatId ?? draftIdRef.current
  /** 新对话草稿或刚从草稿提升：无历史可拉，避免用临时 id 请求 404 */
  const skipHistoryFetch =
    isDraft || (!!routeChatId && promotedDraftId === routeChatId)

  useEffect(() => {
    if (!routeChatId) {
      draftIdRef.current = createDraftChatId()
      setPromotedDraftId(null)
      invalidRouteRef.current = false
    }
  }, [routeChatId])

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

  /** 后台校验直链会话；失败则静默跳回新对话，不挡主区域 */
  useEffect(() => {
    if (!hydrated || !userId || !routeChatId || routeChatId === 'new') return
    if (routeChatId === promotedDraftId) return
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
  }, [hydrated, userId, routeChatId, promotedDraftId, sessions, ensureSession, router])

  const handleNewChat = useCallback(() => {
    setSidebarOpen(false)
    setPromotedDraftId(null)
    if (isDraft) return
    router.replace('/chat')
  }, [isDraft, router])

  const handleSelectSession = useCallback(
    (id: string) => {
      setPromotedDraftId(null)
      if (id !== routeChatId) {
        navigateToChat(id, { replace: true })
      }
      setSidebarOpen(false)
    },
    [routeChatId, navigateToChat]
  )

  const handleDeleteSession = useCallback(
    async (id: string) => {
      const wasActive = id === routeChatId
      const remaining = sessions.filter((s) => s.id !== id)
      await deleteSession(id)

      if (!wasActive) return

      setPromotedDraftId(null)

      if (remaining[0]) {
        navigateToChat(remaining[0].id, { replace: true })
        return
      }

      router.replace('/chat')
    },
    [routeChatId, sessions, deleteSession, navigateToChat, router]
  )

  const handlePersist = useCallback(
    async (persistChatId: string, messages: UIMessage[]) => {
      if (messages.length === 0) return

      if (isDraft) {
        setPromotedDraftId(persistChatId)
        navigateToChat(persistChatId, { replace: true })
        await createSession(persistChatId)
      }

      await saveMessages(persistChatId, messages)
    },
    [isDraft, createSession, navigateToChat, saveMessages]
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
          chatId={activeChatId}
          skipHistoryFetch={skipHistoryFetch}
          onMessagesPersist={(id, messages) => void handlePersist(id, messages)}
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
