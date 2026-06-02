'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Search } from 'lucide-react'
import { AdminBackLink } from '@/components/admin/AdminBackLink'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { Input } from '@/components/ui/input'
import { usePaginatedPage } from '@/hooks/use-paginated-page'
import { PublicUserProfile } from '@/models/user'
import { getApiErrorMessage } from '@/lib/api-error'
import { formatDateTime } from '@/lib/format-date'
import type { Locale } from '@/i18n/routing'

const SEARCH_DEBOUNCE_MS = 300

export default function AdminUsersPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')
  const tProfile = useTranslations('profile')
  const tErrors = useTranslations('errors')
  const locale = useLocale() as Locale
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [searchQuery])

  const {
    items: users,
    pagination,
    loading,
    error,
    page,
    setPage,
  } = usePaginatedPage<PublicUserProfile>({
    basePath: '/api/admin/users',
    search: debouncedSearch,
  })

  const listError = error
    ? getApiErrorMessage(tErrors, error, 'fetchUsersFailed')
    : null

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalCount = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 0

  if (loading && users.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">{tCommon('loading')}</p>
      </div>
    )
  }

  if (listError && users.length === 0) {
    return (
      <div className="py-4">
        <AdminBackLink />
        <p className="text-destructive text-center">{listError}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4">
      <AdminBackLink />

      <div className="space-y-1">
        <h1 className="text-3xl font-bold">{t('usersTitle')}</h1>
        <p className="text-muted-foreground text-sm">
          {t('usersCount', { count: totalCount })}
        </p>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder={t('searchUsers')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {listError && (
        <p className="text-destructive text-sm" role="alert">
          {listError}
        </p>
      )}

      {users.length === 0 ? (
        <div className="rounded-xl border py-12 text-center">
          <p className="text-muted-foreground">
            {debouncedSearch ? t('noUsersMatch') : t('noUsers')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b text-left">
                    <th className="px-4 py-3 font-medium">{t('userColumn')}</th>
                    <th className="px-4 py-3 font-medium">{tProfile('email')}</th>
                    <th className="px-4 py-3 font-medium">{tProfile('userId')}</th>
                    <th className="px-4 py-3 font-medium">{tProfile('lastLogin')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>
                              {user.name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3 font-mono text-xs break-all">
                        {user.id}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                        {user.lastLoginAt
                          ? formatDateTime(user.lastLoginAt, locale)
                          : '-'}
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
    </div>
  )
}
