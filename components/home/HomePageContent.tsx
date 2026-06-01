'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { Plus } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { loginRedirectPath } from '@/lib/locale-path'
import type { Locale } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { GalleryUploadDialog } from '@/components/gallery/GalleryUploadDialog'

export function HomePageContent() {
  const t = useTranslations('home')
  const locale = useLocale() as Locale
  const { status } = useSession()
  const [dialogOpen, setDialogOpen] = useState(false)

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
        <Button onClick={handleAddClick} disabled={isLoading}>
          <Plus className="size-4" />
          {t('addWork')}
        </Button>
      </div>

      <section
        className="border-border bg-muted/30 flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center"
        aria-label={t('waterfallPlaceholder')}
      >
        <p className="text-muted-foreground text-sm">{t('waterfallPlaceholder')}</p>
        {!isAuthenticated && !isLoading && (
          <p className="text-muted-foreground mt-2 text-xs">
            {t('loginHint')}{' '}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              {t('loginLink')}
            </Link>
          </p>
        )}
      </section>

      <GalleryUploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          // 瀑布流展示后续接入；上传成功后仅关闭弹窗
        }}
      />
    </div>
  )
}
