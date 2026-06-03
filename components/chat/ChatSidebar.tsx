'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { Locale } from '@/i18n/routing'
import { MessageSquarePlus, PanelLeftClose, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ChatSessionSummary } from '@/lib/chat/server'

interface ChatSidebarProps {
  sessions: ChatSessionSummary[]
  activeId: string | null
  onNewChat: () => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onClose?: () => void
  className?: string
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
}

function formatRelativeTime(timestamp: number, locale: string) {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const diffMs = timestamp - Date.now()
  const diffMinutes = Math.round(diffMs / (1000 * 60))

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minute')
  }

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour')
  }

  const diffDays = Math.round(diffHours / 24)
  return rtf.format(diffDays, 'day')
}

export function ChatSidebar({
  sessions,
  activeId,
  onNewChat,
  onSelect,
  onDelete,
  onClose,
  className,
  hasMore,
  loadingMore,
  onLoadMore,
}: ChatSidebarProps) {
  const t = useTranslations('chat')
  const tCommon = useTranslations('common')
  const locale = useLocale() as Locale
  const dateLocale = locale === 'en' ? 'en' : 'zh-CN'
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<ChatSessionSummary | null>(
    null
  )
  const [deleting, setDeleting] = useState(false)

  const handleDeleteRequest = (session: ChatSessionSummary) => {
    setPendingDelete(session)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await onDelete(pendingDelete.id)
      setDeleteOpen(false)
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <aside
        className={cn(
          'border-border bg-sidebar flex h-full w-full shrink-0 flex-col border-r md:w-72',
          className
        )}
      >
        <div className="flex items-center gap-2 border-b p-3">
          <Button className="flex-1 gap-2" onClick={onNewChat}>
            <MessageSquarePlus className="size-4" />
            {t('newChat')}
          </Button>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 md:hidden"
              onClick={onClose}
              aria-label={t('closeSidebar')}
            >
              <PanelLeftClose className="size-4" />
            </Button>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
            {t('history')}
          </p>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground px-2 py-6 text-center text-xs">
              {t('noHistory')}
            </p>
          ) : (
            <ul className="space-y-0.5">
              {sessions.map((session) => {
                const active = session.id === activeId
                return (
                  <li key={session.id}>
                    <div
                      className={cn(
                        'group flex items-center gap-1 rounded-lg pr-1',
                        active && 'bg-sidebar-accent'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onSelect(session.id)}
                        className={cn(
                          'hover:bg-sidebar-accent/80 min-w-0 flex-1 rounded-lg px-3 py-2.5 text-left transition-colors',
                          active && 'font-medium'
                        )}
                      >
                        <span className="line-clamp-1 text-sm">{session.title}</span>
                        <span className="text-muted-foreground mt-0.5 block text-xs">
                          {formatRelativeTime(session.updatedAt, dateLocale)}
                        </span>
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 opacity-0 group-hover:opacity-100"
                        onClick={() => handleDeleteRequest(session)}
                        aria-label={t('deleteChat')}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          {hasMore && onLoadMore && (
            <div className="px-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                disabled={loadingMore}
                onClick={onLoadMore}
              >
                {loadingMore ? tCommon('loadingMore') : t('loadMoreHistory')}
              </Button>
            </div>
          )}
        </div>
      </aside>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) setPendingDelete(null)
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{t('confirmDeleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('confirmDeleteDesc', {
                title: pendingDelete?.title ?? '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setDeleteOpen(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => void handleDeleteConfirm()}
            >
              {deleting ? tCommon('deleting') : tCommon('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
