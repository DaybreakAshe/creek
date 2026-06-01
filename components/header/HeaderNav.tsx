'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', labelKey: 'home' },
  { href: '/tools', labelKey: 'tools' },
  { href: '/about', labelKey: 'about' },
] as const

function isNavActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

interface HeaderNavProps {
  /** 移动端菜单内点击链接后关闭 */
  onNavigate?: () => void
  className?: string
  /** 桌面横排 / 移动菜单竖排 */
  orientation?: 'horizontal' | 'vertical'
}

export function HeaderNav({
  onNavigate,
  className,
  orientation = 'horizontal',
}: HeaderNavProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const isVertical = orientation === 'vertical'

  return (
    <nav
      aria-label={t('mainNav')}
      className={cn(
        isVertical
          ? 'flex flex-col gap-0.5'
          : 'flex items-center gap-5 sm:gap-8',
        className
      )}
    >
      {NAV_ITEMS.map((item) => {
        const active = isNavActive(pathname, item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'transition-colors',
              isVertical
                ? 'hover:bg-accent rounded-lg px-3 py-2.5 text-base'
                : 'text-sm',
              active
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t(item.labelKey)}
          </Link>
        )
      })}
    </nav>
  )
}
