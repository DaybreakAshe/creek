import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

/** 顶栏右侧图标按钮统一风格（与主题切换、语言一致） */
export function headerIconButtonClassName(className?: string) {
  return cn(
    buttonVariants({ variant: 'ghost', size: 'icon' }),
    'text-muted-foreground hover:text-foreground size-9',
    className
  )
}
