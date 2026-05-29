'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { User } from 'lucide-react'
import { PublicUserProfile } from '@/models/user'
import { UserAvatar } from '@/components/header/UserAvatar'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const { status } = useSession()
  const [profile, setProfile] = useState<PublicUserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      window.location.href = '/login?callbackUrl=/profile'
      return
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/me')
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || '获取个人信息失败')
        }
        const data: PublicUserProfile = await response.json()
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取个人信息失败')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-8 text-center">
        <p className="text-destructive">{error ?? '无法加载个人信息'}</p>
        <Button variant="outline" asChild>
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 py-4">
      <div className="space-y-2">
        <div className="text-muted-foreground flex items-center gap-2">
          <User className="size-5" />
          <span className="text-sm font-medium">个人信息</span>
        </div>
        <h1 className="text-3xl font-bold">个人主页</h1>
      </div>

      <section className="flex flex-col items-center gap-4 rounded-xl border p-8">
        <UserAvatar user={profile} />
        <div className="space-y-1 text-center">
          <p className="text-xl font-semibold">{profile.name}</p>
          <p className="text-muted-foreground text-sm">{profile.email}</p>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">账户详情</h2>
        <dl className="grid gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">User ID</dt>
            <dd className="mt-1 font-mono break-all">{profile.id}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">邮箱</dt>
            <dd className="mt-1">{profile.email}</dd>
          </div>
          {profile.lastLoginAt && (
            <div>
              <dt className="text-muted-foreground">最近登录</dt>
              <dd className="mt-1">
                {new Date(profile.lastLoginAt).toLocaleString('zh-CN')}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <Button variant="outline" asChild>
        <Link href="/">返回首页</Link>
      </Button>
    </div>
  )
}
