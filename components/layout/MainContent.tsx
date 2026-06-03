import { cn } from '@/lib/utils'

export type MainContentVariant = 'constrained' | 'full'

interface MainContentProps {
  variant?: MainContentVariant
  children: React.ReactNode
  className?: string
}

/** 页面主内容区：`constrained` 居中限宽（首页、工具等），`full` 占满可用区域（聊天等）。 */
export function MainContent({
  variant = 'constrained',
  children,
  className,
}: MainContentProps) {
  if (variant === 'full') {
    return (
      <div
        className={cn('flex min-h-0 flex-1 flex-col overflow-hidden', className)}
      >
        {children}
      </div>
    )
  }

  return (
    <div className={cn('container mx-auto px-3 py-4', className)}>{children}</div>
  )
}
