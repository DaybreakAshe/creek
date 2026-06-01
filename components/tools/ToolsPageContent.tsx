'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useSession } from 'next-auth/react'
import { Plus, Search, UserRound } from 'lucide-react'
import { canManageTool } from '@/lib/tool-auth'
import { getApiErrorMessage } from '@/lib/api-error'
import { loginRedirectPath } from '@/lib/locale-path'
import type { Locale } from '@/i18n/routing'
import { ToolCard } from '@/components/tools/ToolCard'
import { ToolDialog } from '@/components/tools/ToolDialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ToolLink } from '@/models/tool'

type ToolsScope = 'public' | 'mine'

interface ToolsPageContentProps {
  scope: ToolsScope
}

export function ToolsPageContent({ scope }: ToolsPageContentProps) {
  const t = useTranslations('tools')
  const tCommon = useTranslations('common')
  const tErrors = useTranslations('errors')
  const locale = useLocale() as Locale
  const { data: session, status } = useSession()
  const [tools, setTools] = useState<ToolLink[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<ToolLink | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userId = session?.user?.id

  const fetchTools = async (targetUserId?: string) => {
    try {
      setError(null)
      const url =
        scope === 'mine' && targetUserId
          ? `/api/tools?userId=${encodeURIComponent(targetUserId)}`
          : '/api/tools'
      const response = await fetch(url)
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(
          getApiErrorMessage(tErrors, data.error, 'fetchToolsFailed')
        )
      }
      const data = await response.json()
      setTools(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('fetchFailed')
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (scope === 'mine') {
      if (status === 'loading') return
      if (status === 'unauthenticated') {
        window.location.href = loginRedirectPath('/tools/mine', locale)
        return
      }
      if (!session?.user?.id) return
      fetchTools(session.user.id)
      return
    }
    fetchTools()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, status, session?.user?.id, locale])

  const handleSave = async (toolData: Partial<ToolLink>) => {
    try {
      setError(null)
      if (editingTool?._id) {
        const response = await fetch(`/api/tools/${editingTool._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toolData),
        })
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(
            getApiErrorMessage(tErrors, data.error, 'updateToolFailed')
          )
        }
      } else {
        const response = await fetch('/api/tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toolData),
        })
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(
            getApiErrorMessage(tErrors, data.error, 'createToolFailed')
          )
        }
      }
      fetchTools(scope === 'mine' ? userId : undefined)
      setEditingTool(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('saveFailed'))
    }
  }

  const handleDeleteRequest = (id: string) => {
    setPendingDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return
    const id = pendingDeleteId
    setDeleting(true)
    try {
      setError(null)
      const response = await fetch(`/api/tools/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(
          getApiErrorMessage(tErrors, data.error, 'deleteToolFailed')
        )
      }
      fetchTools(scope === 'mine' ? userId : undefined)
      setDeleteDialogOpen(false)
      setPendingDeleteId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('deleteFailed'))
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = (tool: ToolLink) => {
    setEditingTool(tool)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    if (status === 'unauthenticated') {
      window.location.href = loginRedirectPath(
        scope === 'mine' ? '/tools/mine' : '/tools',
        locale
      )
      return
    }
    setEditingTool(null)
    setDialogOpen(true)
  }

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading || (scope === 'mine' && status === 'loading')) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">{tCommon('loading')}</p>
      </div>
    )
  }

  const isMine = scope === 'mine'

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">
            {isMine ? t('mineTitle') : t('publicTitle')}
          </h1>
          <p className="text-muted-foreground">
            {isMine ? t('mineDesc') : t('publicDesc')}
          </p>
        </div>
        {isMine ? (
          <Button variant="outline" asChild>
            <Link href="/tools">{t('browsePublic')}</Link>
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href="/tools/mine">
              <UserRound className="size-4" />
              {t('myTools')}
            </Link>
          </Button>
        )}
      </div>

      {error && <p className="text-destructive mb-4 text-sm">{error}</p>}

      <div className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {isMine && (
          <Button onClick={handleAdd}>
            <Plus className="size-4" />
            {t('addTool')}
          </Button>
        )}
      </div>

      {filteredTools.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? t('noMatch')
              : isMine
                ? t('noMineTools')
                : t('noPublicTools')}
          </p>
          {isMine && !searchQuery && (
            <Button onClick={handleAdd} variant="outline">
              <Plus className="size-4" />
              {t('addFirstTool')}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTools.map((tool) => {
            const manageable = canManageTool(tool, userId)
            return (
              <ToolCard
                key={tool._id}
                tool={tool}
                canManage={manageable}
                showVisibility={isMine}
                onEdit={manageable ? handleEdit : undefined}
                onDelete={manageable ? handleDeleteRequest : undefined}
              />
            )
          })}
        </div>
      )}

      <ToolDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tool={editingTool}
        onSave={handleSave}
      />

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setPendingDeleteId(null)
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{t('confirmDeleteTitle')}</DialogTitle>
            <DialogDescription>{t('confirmDeleteDesc')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setDeleteDialogOpen(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={handleDeleteConfirm}
            >
              {deleting ? tCommon('deleting') : tCommon('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
