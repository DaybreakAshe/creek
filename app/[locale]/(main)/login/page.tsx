'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function LoginPage() {
  const t = useTranslations('auth')
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    try {
      setError(null)
      await signIn('google', { callbackUrl: '/' })
    } catch (err) {
      setError(t('signInFailed'))
      console.error('Sign in error:', err)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/login' })
    } catch (err) {
      setError(t('signOutFailed'))
      console.error('Sign out error:', err)
    }
  }

  const isLoading = status === 'loading'

  if (session) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold">{t('welcomeBack')}</h1>
          <p className="text-muted-foreground">
            {t('loggedInAs', { email: session.user?.email ?? '' })}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSignOut}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? t('signingOut') : t('signOut')}
          </Button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">{t('login')}</h1>
        <p className="text-muted-foreground">{t('signInHint')}</p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button onClick={handleGoogleSignIn} disabled={isLoading} size="lg">
        {isLoading ? t('signingIn') : t('signInWithGoogle')}
      </Button>
    </div>
  )
}
