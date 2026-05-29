import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Shield, Wrench, Users } from 'lucide-react'
import { getServerAuthSession } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { connectToDatabase } from '@/lib/mongodb'
import User, { type UserInfo } from '@/models/user'
import { Button } from '@/components/ui/button'

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  )
}

async function AdminPageContent() {
  const session = await getServerAuthSession()

  if (!session?.user?.id || !isAdmin(session.user.id)) {
    notFound()
  }

  await connectToDatabase()
  const dbUser = (await User.findOne({ id: session.user.id }).lean()) as UserInfo | null
  const userCount = await User.countDocuments()

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-orange-500">
          <Shield className="size-5" />
          <span className="text-sm font-medium">Admin</span>
        </div>
        <h1 className="text-3xl font-bold">管理后台</h1>
        <p className="text-muted-foreground">
          欢迎，{session.user.name ?? session.user.email}
        </p>
      </div>

      <section className="space-y-4 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">当前账户</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">User ID</dt>
            <dd className="mt-1 font-mono break-all">{session.user.id}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">邮箱</dt>
            <dd className="mt-1">{session.user.email}</dd>
          </div>
          {dbUser?.lastLoginAt && (
            <div>
              <dt className="text-muted-foreground">最近登录</dt>
              <dd className="mt-1">
                {new Date(dbUser.lastLoginAt).toLocaleString('zh-CN')}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">快捷入口</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/tools"
            className="flex items-start gap-4 rounded-xl border p-5 transition-colors hover:bg-muted/50"
          >
            <Wrench className="mt-0.5 size-5 shrink-0 text-orange-500" />
            <div>
              <p className="font-medium">工具管理</p>
              <p className="text-muted-foreground mt-1 text-sm">
                管理站点工具链接
              </p>
            </div>
          </Link>

          <div className="flex items-start gap-4 rounded-xl border p-5">
            <Users className="mt-0.5 size-5 shrink-0 text-orange-500" />
            <div>
              <p className="font-medium">注册用户</p>
              <p className="text-muted-foreground mt-1 text-sm">
                共 {userCount} 位用户已登录并写入数据库
              </p>
            </div>
          </div>
        </div>
      </section>

      <div>
        <Button variant="outline" asChild>
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    </div>
  )
}
