import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function ErrorContent({ error }: { readonly error: string | null }) {
  const errorMessages: Record<string, string> = {
    Configuration:
      '服务器配置错误。请检查环境变量（GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET）。',
    AccessDenied: '访问被拒绝。',
    Verification: '验证令牌时出错。',
    OAuthCallback: 'OAuth 回调错误。请检查 Google OAuth 配置。',
    OAuthAccountNotLinked: '此邮箱已被其他账户使用。',
    OAuthCreateAccount: '创建账户时出错。',
    Default: '发生了未知错误。',
  }

  const errorMessage = error
    ? errorMessages[error] || errorMessages.Default
    : '未知错误'

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold text-red-500">认证错误</h1>
        <p className="text-muted-foreground">{errorMessage}</p>
        {error && (
          <div className="mt-4 rounded-md bg-gray-100 p-4 dark:bg-gray-800">
            <p className="font-mono text-sm">错误代码: {error}</p>
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <Link href="/login">
          <Button variant="outline">返回登录</Button>
        </Link>
      </div>
    </div>
  )
}

export default async function AuthErrorPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return <ErrorContent error={params.error || null} />
}
