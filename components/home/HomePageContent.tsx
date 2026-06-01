'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { FolderOpen, Plus } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { loginRedirectPath } from '@/lib/locale-path'
import type { Locale } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { GalleryUploadDialog } from '@/components/gallery/GalleryUploadDialog'
import { GalleryMasonry } from '@/components/gallery/GalleryMasonry'

export function HomePageContent() {
  const t = useTranslations('home')
  const locale = useLocale() as Locale
  const { status } = useSession()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [galleryRefreshToken, setGalleryRefreshToken] = useState(0)

  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'

  const handleAddClick = () => {
    if (!isAuthenticated) {
      window.location.href = loginRedirectPath('/', locale)
      return
    }
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAuthenticated && (
            <Button variant="outline" asChild disabled={isLoading}>
              <Link href="/gallery/mine">
                <FolderOpen className="size-4" />
                {t('myWorks')}
              </Link>
            </Button>
          )}
          <Button onClick={handleAddClick} disabled={isLoading}>
            <Plus className="size-4" />
            {t('addWork')}
          </Button>
        </div>
      </div>

      <GalleryMasonry refreshToken={galleryRefreshToken} />

      {!isAuthenticated && !isLoading && (
        <p className="text-muted-foreground text-center text-xs">
          {t('loginHint')}{' '}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            {t('loginLink')}
          </Link>
        </p>
      )}

      <GalleryUploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => setGalleryRefreshToken((k) => k + 1)}
      />
    </div>
  )
}
