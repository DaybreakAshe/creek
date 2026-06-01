'use client'

import { Github, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { headerIconButtonClassName } from '@/components/header/header-actions'

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

export function HeaderSocial() {
  const t = useTranslations('nav')

  return (
    <div className="hidden items-center md:flex">
      {socialLinks.map((item) => {
        const Icon = item.icon
        return (
          <a
            key={item.key}
            href={item.href}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            aria-label={t(item.labelKey)}
            className={headerIconButtonClassName()}
          >
            <Icon className="size-4" strokeWidth={1.5} />
          </a>
        )
      })}
    </div>
  )
}
