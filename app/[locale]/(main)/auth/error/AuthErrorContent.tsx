'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

export function AuthErrorContent({ error }: { readonly error: string | null }) {
  const t = useTranslations('auth')

  const errorKeys = [
    'Configuration',
    'AccessDenied',
    'Verification',
    'OAuthCallback',
    'OAuthAccountNotLinked',
    'OAuthCreateAccount',
    'Default',
  ] as const

  const errorMessage = error
    ? errorKeys.includes(error as (typeof errorKeys)[number])
      ? t(`errors.${error as (typeof errorKeys)[number]}`)
      : t('errors.Default')
    : t('errors.unknown')

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold text-red-500">{t('authError')}</h1>
        <p className="text-muted-foreground">{errorMessage}</p>
        {error && (
          <div className="mt-4 rounded-md bg-gray-100 p-4 dark:bg-gray-800">
            <p className="font-mono text-sm">{t('errorCode', { code: error })}</p>
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <Link href="/login">
          <Button variant="outline">{t('backToLogin')}</Button>
        </Link>
      </div>
    </div>
  )
}
