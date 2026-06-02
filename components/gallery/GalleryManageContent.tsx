/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { Link } from '@/i18n/navigation'
import { ExternalLink, Search, Trash2 } from 'lucide-react'
import { AdminBackLink } from '@/components/admin/AdminBackLink'
import { getApiErrorMessage } from '@/lib/api-error'
import { formatDateTime } from '@/lib/format-date'
import { formatFileSize } from '@/lib/format-file-size'
import { loginRedirectPath } from '@/lib/locale-path'
import type { GalleryItemRecord } from '@/lib/gallery-types'
import type { Locale } from '@/i18n/routing'
import { usePaginatedPage } from '@/hooks/use-paginated-page'
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
import { Input } from '@/components/ui/input'

type GalleryManageScope = 'mine' | 'admin'

interface GalleryManageContentProps {
  scope: GalleryManageScope
}

const SEARCH_DEBOUNCE_MS = 300

export function GalleryManageContent({ scope }: GalleryManageContentProps) {
  const t = useTranslations('gallery.manage')
  const tGallery = useTranslations('home.gallery')
  const tCommon = useTranslations('common')
  const tErrors = useTranslations('errors')
  const tProfile = useTranslations('profile')
  const locale = useLocale() as Locale
  const { data: session, status } = useSession()

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<GalleryItemRecord | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      const path = scope === 'admin' ? '/admin/gallery' : '/gallery/mine'
      window.location.href = loginRedirectPath(path, locale)
    }
  }, [status, scope, locale])

  const listEnabled =
    status === 'authenticated' &&
    (scope === 'admin' || Boolean(session?.user?.id))

  const listQuery = useMemo(
    () =>
      scope === 'mine' && session?.user?.id
        ? { userId: session.user.id }
        : {},
    [scope, session?.user?.id]
  )

  const {
    items,
    pagination,
    loading,
    error: listError,
    page,
    setPage,
    refresh,
  } = usePaginatedPage<GalleryItemRecord>({
    basePath: scope === 'admin' ? '/api/admin/gallery' : '/api/gallery',
    query: listQuery,
    search: debouncedSearch,
    enabled: listEnabled,
    resetDeps: [scope, session?.user?.id],
  })

  const error =
    actionError ??
    (listError
      ? getApiErrorMessage(tErrors, listError, 'fetchGalleryFailed')
      : null)

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteRequest = (item: GalleryItemRecord) => {
    setPendingDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDelete?._id) return
    setDeleting(true)
    try {
      setActionError(null)
      const response = await fetch(`/api/gallery/${pendingDelete._id}`, {
        method: 'DELETE',
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            tErrors,
            typeof data.error === 'string' ? data.error : undefined,
            'deleteGalleryFailed'
          )
        )
      }
      setDeleteDialogOpen(false)
      setPendingDelete(null)
      refresh()
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : getApiErrorMessage(tErrors, undefined, 'deleteGalleryFailed')
      )
    } finally {
      setDeleting(false)
    }
  }

  const handleTogglePublic = async (item: GalleryItemRecord) => {
    if (!item._id) return
    setTogglingId(item._id)
    try {
      setActionError(null)
      const response = await fetch(`/api/gallery/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !item.isPublic }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            tErrors,
            typeof data.error === 'string' ? data.error : undefined,
            'updateGalleryFailed'
          )
        )
      }
      refresh()
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : getApiErrorMessage(tErrors, undefined, 'updateGalleryFailed')
      )
    } finally {
      setTogglingId(null)
    }
  }

  const totalCount = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 0

  if (loading || status === 'loading') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">{tCommon('loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4">
      {scope === 'admin' && <AdminBackLink />}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">
            {scope === 'admin' ? t('adminTitle') : t('mineTitle')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('itemsCount', { count: totalCount })}
          </p>
        </div>
        {scope === 'mine' && (
          <Button variant="outline" asChild>
            <Link href="/">{t('backHome')}</Link>
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border py-12 text-center">
          <p className="text-muted-foreground">
            {debouncedSearch ? t('noMatch') : t('empty')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b text-left">
                    <th className="px-4 py-3 font-medium">{t('preview')}</th>
                    <th className="px-4 py-3 font-medium">{t('title')}</th>
                    <th className="px-4 py-3 font-medium">{t('type')}</th>
                    <th className="px-4 py-3 font-medium">{t('public')}</th>
                    {scope === 'admin' && (
                      <>
                        <th className="px-4 py-3 font-medium">{t('creator')}</th>
                        <th className="px-4 py-3 font-medium">{tProfile('userId')}</th>
                      </>
                    )}
                    <th className="px-4 py-3 font-medium">{t('fileInfo')}</th>
                    <th className="px-4 py-3 font-medium">{t('createdAt')}</th>
                    <th className="px-4 py-3 text-right font-medium">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} className="border-b last:border-b-0">
                      <td className="px-4 py-3">
                        <a
                          href={item.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-muted block size-14 overflow-hidden rounded-md"
                        >
                          {item.type === 'image' ? (
                            <img
                              src={item.mediaUrl}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <span className="text-muted-foreground flex size-full items-center justify-center text-xs">
                              {tGallery(`types.${item.type}`)}
                            </span>
                          )}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-[160px] font-medium">{item.title}</p>
                        {item.description ? (
                          <p className="text-muted-foreground mt-0.5 max-w-[180px] truncate text-xs">
                            {item.description}
                          </p>
                        ) : null}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                        {tGallery(`types.${item.type}`)}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={togglingId === item._id}
                          onClick={() => handleTogglePublic(item)}
                        >
                          {item.isPublic ? tCommon('yes') : tCommon('no')}
                        </Button>
                      </td>
                      {scope === 'admin' && (
                        <>
                          <td className="px-4 py-3">
                            <p className="max-w-[120px] truncate">
                              {item.creatorName || '-'}
                            </p>
                            <p className="text-muted-foreground max-w-[140px] truncate text-xs">
                              {item.creatorEmail || '-'}
                            </p>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs break-all">
                            {item.userId}
                          </td>
                        </>
                      )}
                      <td className="text-muted-foreground px-4 py-3 text-xs">
                        <p className="max-w-[160px] truncate">
                          {item.originalFilename || item.mediaFilename || '-'}
                        </p>
                        <p className="mt-0.5">
                          {item.fileExtension ? `.${item.fileExtension}` : '-'}
                          {item.fileSize
                            ? ` · ${formatFileSize(item.fileSize, locale)}`
                            : ''}
                        </p>
                        <p className="mt-0.5 max-w-[160px] truncate">
                          {item.mimeType || '-'}
                        </p>
                      </td>
                      <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                        {item.createdAt
                          ? formatDateTime(item.createdAt, locale)
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <a
                              href={item.mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={t('view', { title: item.title })}
                            >
                              <ExternalLink className="size-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t('delete', { title: item.title })}
                            onClick={() => handleDeleteRequest(item)}
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

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setPendingDelete(null)
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{t('confirmDeleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('confirmDeleteDesc', { title: pendingDelete?.title ?? '' })}
            </DialogDescription>
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
