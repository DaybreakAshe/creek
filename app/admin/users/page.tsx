'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { AdminBackLink } from '@/components/admin/AdminBackLink'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { PublicUserProfile } from '@/models/user'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PublicUserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users')
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || '获取用户列表失败')
        }
        const data: PublicUserProfile[] = await response.json()
        setUsers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取用户列表失败')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-4">
        <AdminBackLink />
        <p className="text-destructive text-center">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4">
      <AdminBackLink />

      <div className="space-y-1">
        <h1 className="text-3xl font-bold">注册用户</h1>
        <p className="text-muted-foreground text-sm">共 {users.length} 位用户</p>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="搜索姓名、邮箱、User ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div className="rounded-xl border py-12 text-center">
          <p className="text-muted-foreground">
            {searchQuery ? '没有找到匹配的用户' : '暂无注册用户'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-muted/50 border-b text-left">
                  <th className="px-4 py-3 font-medium">用户</th>
                  <th className="px-4 py-3 font-medium">邮箱</th>
                  <th className="px-4 py-3 font-medium">User ID</th>
                  <th className="px-4 py-3 font-medium">最近登录</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
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
                        ? new Date(user.lastLoginAt).toLocaleString('zh-CN')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
