'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { User } from 'lucide-react'
import { PublicUserProfile } from '@/models/user'
import { UserAvatar } from '@/components/header/UserAvatar'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api-error'
import { formatDateTime } from '@/lib/format-date'
import { loginRedirectPath } from '@/lib/locale-path'
import type { Locale } from '@/i18n/routing'
import { useSession } from 'next-auth/react'

export default function ProfilePage() {
  const t = useTranslations('profile')
  const tCommon = useTranslations('common')
  const tErrors = useTranslations('errors')
  const locale = useLocale() as Locale
  const { status } = useSession()
  const [profile, setProfile] = useState<PublicUserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      window.location.href = loginRedirectPath('/profile', locale)
      return
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/me')
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(
            getApiErrorMessage(tErrors, data.error, 'fetchProfileFailed')
          )
        }
        const data: PublicUserProfile = await response.json()
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('fetchFailed'))
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [status, t, tErrors])

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">{tCommon('loading')}</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-8 text-center">
        <p className="text-destructive">{error ?? t('loadFailed')}</p>
        <Button variant="outline" asChild>
          <Link href="/">{tCommon('backHome')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 py-4">
      <div className="space-y-2">
        <div className="text-muted-foreground flex items-center gap-2">
          <User className="size-5" />
          <span className="text-sm font-medium">{t('sectionLabel')}</span>
        </div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>

      <section className="flex flex-col items-center gap-4 rounded-xl border p-8">
        <UserAvatar user={profile} />
        <div className="space-y-1 text-center">
          <p className="text-xl font-semibold">{profile.name}</p>
          <p className="text-muted-foreground text-sm">{profile.email}</p>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">{t('accountDetails')}</h2>
        <dl className="grid gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">{t('userId')}</dt>
            <dd className="mt-1 font-mono break-all">{profile.id}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t('email')}</dt>
            <dd className="mt-1">{profile.email}</dd>
          </div>
          {profile.lastLoginAt && (
            <div>
              <dt className="text-muted-foreground">{t('lastLogin')}</dt>
              <dd className="mt-1">
                {formatDateTime(profile.lastLoginAt, locale)}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <Button variant="outline" asChild>
        <Link href="/">{tCommon('backHome')}</Link>
      </Button>
    </div>
  )
}
