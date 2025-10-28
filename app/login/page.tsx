'use client'

import { signIn, signOut, useSession, getSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { loadUser, saveUser, removeUser } from '@/lib/localStorage'

const LoginPage = () => {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokenInfo, setTokenInfo] = useState<string>('')

  // 获取 token 信息
  const getTokenInfo = async () => {
    try {
      const sessionData = await getSession()
      if (sessionData) {
        // @ts-ignore - NextAuth 类型定义可能不完整
        const accessToken = sessionData.accessToken
        console.log("登录信息:", sessionData)
        if (accessToken) {
          setTokenInfo(accessToken)
          console.log('Access Token:', accessToken)

          // 保存到 localStorage
          saveUser({
            id: '',
            name: sessionData.user?.name || '',
            email: sessionData.user?.email || '',
            avatar: sessionData.user?.image || '',
            token: accessToken,
          })
        } else {
          console.log('No access token found in session')
        }
      }
    } catch (err) {
      console.error('Failed to get token info:', err)
    }
  }

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

  // 当用户登录后自动获取 token
  useEffect(() => {
    if (session) {
      getTokenInfo()
    }
  }, [session])

  if (session) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold">欢迎回来！</h1>
          <p className="text-muted-foreground">
            已登录为: {session.user?.email}
          </p>
        </div>

        {/* 显示 token 信息 */}
        {tokenInfo && (
          <div className="w-full max-w-md space-y-2 rounded-md border p-4">
            <p className="text-sm font-semibold">Access Token:</p>
            <p className="text-muted-foreground text-xs break-all">
              {tokenInfo.substring(0, 50)}...
            </p>
            <p className="text-muted-foreground text-xs">
              Token 已保存到 localStorage
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={getTokenInfo}
            disabled={isLoading}
            variant="secondary"
          >
            刷新 Token
          </Button>
          <Button
            onClick={handleSignOut}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? '登出中...' : '登出'}
          </Button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
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
