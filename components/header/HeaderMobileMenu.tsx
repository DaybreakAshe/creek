'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Github, Mail, Menu, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { HeaderNav } from '@/components/header/HeaderNav'
import { headerIconButtonClassName } from '@/components/header/header-actions'
import { Separator } from '@/components/ui/separator'

const socialLinks = [
  {
    key: 'github',
    href: 'https://github.com/DaybreakAshe/creek',
    labelKey: 'github' as const,
    icon: Github,
  },
  {
    key: 'email',
    href: 'mailto:',
    labelKey: 'sendEmail' as const,
    icon: Mail,
  },
] as const

export function HeaderMobileMenu() {
  const t = useTranslations('nav')
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        aria-label={open ? t('closeMenu') : t('openMenu')}
        aria-expanded={open}
        className={headerIconButtonClassName('md:hidden')}
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" strokeWidth={1.5} />
      </button>

      <DialogContent className="bg-background fixed inset-y-0 right-0 left-auto top-0 flex h-full w-[min(100vw,18rem)] max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 border-l p-0 shadow-xl [&>button:last-child]:hidden">
        <div className="flex h-14 items-center justify-between border-b px-4">
          <DialogTitle className="text-sm font-semibold">{t('mainNav')}</DialogTitle>
          <button
            type="button"
            aria-label={t('closeMenu')}
            className={headerIconButtonClassName('size-9')}
            onClick={close}
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <HeaderNav orientation="vertical" onNavigate={close} />
        </div>

        <div className="border-t px-4 py-4">
          <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
            {t('connect')}
          </p>
          <div className="flex gap-1">
            {socialLinks.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.key}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={
                    item.href.startsWith('http') ? 'noopener noreferrer' : undefined
                  }
                  aria-label={t(item.labelKey)}
                  className={headerIconButtonClassName()}
                >
                  <Icon className="size-4" strokeWidth={1.5} />
                </a>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
