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

export function HeaderNav() {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <nav
      aria-label={t('mainNav')}
      className="flex items-center gap-6 sm:gap-8"
    >
      {NAV_ITEMS.map((item) => {
        const active = isNavActive(pathname, item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm transition-colors',
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
