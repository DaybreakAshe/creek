'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages } from 'lucide-react'

const localeLabels: Record<Locale, string> = {
  zh: '中文',
  en: 'English',
}

export function LanguageSwitcher() {
  const t = useTranslations('language')
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (nextLocale: Locale) => {
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('label')}
          className="size-8"
        >
          <Languages className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8}>
        {routing.locales.map((item) => (
          <DropdownMenuItem
            key={item}
            disabled={item === locale}
            onSelect={() => switchLocale(item)}
          >
            {localeLabels[item]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
