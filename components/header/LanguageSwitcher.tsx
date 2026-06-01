'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check, ChevronDown, Languages } from 'lucide-react'
import { headerIconButtonClassName } from '@/components/header/header-actions'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
  const t = useTranslations('language')
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('label')}
          className={cn(
            headerIconButtonClassName(),
            'md:w-auto md:min-w-0 md:gap-1 md:px-2.5'
          )}
        >
          <Languages className="size-4 md:hidden" strokeWidth={1.5} />
          <span className="hidden text-xs font-medium md:inline">
            {t(`short.${locale}`)}
          </span>
          <ChevronDown className="hidden size-3.5 opacity-60 md:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8}>
        {routing.locales.map((item) => (
          <DropdownMenuItem key={item} onSelect={() => switchLocale(item)}>
            {t(item)}
            {item === locale && <Check className="ml-auto size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
