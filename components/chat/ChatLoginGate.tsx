'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { MessageCircle } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { loginRedirectPath } from '@/lib/locale-path'
import { Button } from '@/components/ui/button'

export function ChatLoginGate() {
  const t = useTranslations('chat')
  const locale = useLocale() as Locale

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="bg-muted flex size-16 items-center justify-center rounded-2xl">
        <MessageCircle className="text-muted-foreground size-8" />
      </div>
      <div className="max-w-sm space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground text-sm">{t('loginRequired')}</p>
      </div>
      <Button asChild>
        <Link href={loginRedirectPath('/chat', locale)}>{t('loginButton')}</Link>
      </Button>
    </div>
  )
}
