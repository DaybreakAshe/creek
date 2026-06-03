'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { AdminBackLink } from '@/components/admin/AdminBackLink'
import { ToolDialog } from '@/components/tools/ToolDialog'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ToolIcon } from '@/components/tools/ToolIcon'
import { ListSearchInput } from '@/components/ui/list-search-input'
import {
  useDebouncedSearch,
  useListSearchFetchUi,
} from '@/hooks/use-list-search-ui'
import { usePaginatedPage } from '@/hooks/use-paginated-page'
import { getApiErrorMessage } from '@/lib/api-error'
import { ToolLink } from '@/models/tool'
import { formatDateTime } from '@/lib/format-date'
import type { Locale } from '@/i18n/routing'

export default function AdminToolsPage() {
  const t = useTranslations('admin')
  const tTools = useTranslations('tools')
  const tCommon = useTranslations('common')
  const tProfile = useTranslations('profile')
  const tErrors = useTranslations('errors')
  const locale = useLocale() as Locale
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<ToolLink | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const {
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    isComposing,
    handleCompositionStart,
    handleCompositionEnd,
  } = useDebouncedSearch()

  const {
    items: tools,
    pagination,
    loading,
    error,
    page,
    setPage,
    refresh,
  } = usePaginatedPage<ToolLink>({
    basePath: '/api/admin/tools',
    search: debouncedSearch,
  })

  const { isInitialLoad, showSearchSpinner } = useListSearchFetchUi({
    loading,
    searchQuery,
    debouncedSearch,
    isComposing,
  })

  const listError = error
    ? getApiErrorMessage(tErrors, error, 'fetchToolsFailed')
    : null

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async (toolData: Partial<ToolLink>) => {
    try {
      if (editingTool?._id) {
        const response = await fetch(`/api/tools/${editingTool._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toolData),
        })
        if (!response.ok) throw new Error('Failed to update tool')
      } else {
        const response = await fetch('/api/tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toolData),
        })
        if (!response.ok) throw new Error('Failed to create tool')
      }
      refresh()
      setEditingTool(null)
    } catch (err) {
      console.error('Error saving tool:', err)
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
      const response = await fetch(`/api/tools/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete tool')
      refresh()
      setDeleteDialogOpen(false)
      setPendingDeleteId(null)
    } catch (err) {
      console.error('Error deleting tool:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = (tool: ToolLink) => {
    setEditingTool(tool)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingTool(null)
    setDialogOpen(true)
  }

  const totalCount = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 0

  if (isInitialLoad) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">{tCommon('loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4">
      <AdminBackLink />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{t('toolsTitle')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('toolsCount', { count: totalCount })}
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="size-4" />
          {t('addTool')}
        </Button>
      </div>

      <ListSearchInput
        placeholder={t('searchTools')}
        value={searchQuery}
        onChange={setSearchQuery}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        showSpinner={showSearchSpinner}
      />

      {listError && (
        <p className="text-destructive text-sm" role="alert">
          {listError}
        </p>
      )}

      {tools.length === 0 ? (
        <div className="rounded-xl border py-12 text-center">
          <p className="text-muted-foreground mb-4">
            {debouncedSearch ? t('noToolsMatch') : t('noTools')}
          </p>
          {!debouncedSearch && (
            <Button onClick={handleAdd} variant="outline">
              <Plus className="size-4" />
              {t('addFirstTool')}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b text-left">
                    <th className="px-4 py-3 font-medium">{t('name')}</th>
                    <th className="px-4 py-3 font-medium">{t('url')}</th>
                    <th className="px-4 py-3 font-medium">{t('category')}</th>
                    <th className="px-4 py-3 font-medium">{t('public')}</th>
                    <th className="px-4 py-3 font-medium">{tProfile('userId')}</th>
                    <th className="px-4 py-3 font-medium">{t('description')}</th>
                    <th className="px-4 py-3 font-medium">{t('updatedAt')}</th>
                    <th className="px-4 py-3 text-right font-medium">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {tools.map((tool) => (
                    <tr key={tool._id} className="border-b last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ToolIcon icon={tool.icon} name={tool.name} size="sm" />
                          <span className="font-medium">{tool.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary max-w-[200px] truncate hover:underline"
                        >
                          {tool.url}
                        </Link>
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {tool.category || 'general'}
                      </td>
                      <td className="px-4 py-3">
                        {tool.isPublic ? tCommon('yes') : tCommon('no')}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs break-all">
                        {tool.userId || '-'}
                      </td>
                      <td className="text-muted-foreground max-w-[180px] truncate px-4 py-3">
                        {tool.description || '-'}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                        {tool.updatedAt
                          ? formatDateTime(tool.updatedAt, locale)
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t('editTool', { name: tool.name })}
                            onClick={() => handleEdit(tool)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t('deleteTool', { name: tool.name })}
                            onClick={() => handleDeleteRequest(tool._id!)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <PaginationControls
            page={page}
            totalPages={totalPages}
            total={totalCount}
            disabled={loading}
            onPageChange={handlePageChange}
          />
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
            <DialogTitle>{tTools('confirmDeleteTitle')}</DialogTitle>
            <DialogDescription>{tTools('confirmDeleteDesc')}</DialogDescription>
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
