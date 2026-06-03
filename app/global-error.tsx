'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="zh">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 font-sans antialiased">
        <h1 className="text-lg font-semibold">页面加载异常</h1>
        <p className="text-muted-foreground max-w-md text-center text-sm">
          开发环境可能是 Turbopack 缓存过期。请尝试硬刷新（Cmd+Shift+R），或重启开发服务器并删除
          .next 目录。
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium"
        >
          重试
        </button>
      </body>
    </html>
  )
}
