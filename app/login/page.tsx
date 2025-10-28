'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const LoginPage = () => {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await signIn('google', { callbackUrl: '/' })
    } catch (err) {
      setError('登录失败，请稍后重试')
      console.error('Sign in error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await signOut({ callbackUrl: '/login' })
    } catch (err) {
      setError('登出失败，请稍后重试')
      console.error('Sign out error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (session) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold">欢迎回来！</h1>
          <p className="text-muted-foreground">
            已登录为: {session.user?.email}
          </p>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button onClick={handleSignOut} disabled={isLoading} variant="outline">
          {isLoading ? '登出中...' : '登出'}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">登录</h1>
        <p className="text-muted-foreground">使用你的 Google 账户继续</p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button onClick={handleGoogleSignIn} disabled={isLoading} size="lg">
        {isLoading ? '登录中...' : '使用 Google 登录'}
      </Button>
    </div>
  )
}

export default LoginPage
