'use client'

import { ChevronLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

interface AdminBackLinkProps {
  href?: '/admin'
}

export function AdminBackLink({ href = '/admin' }: AdminBackLinkProps) {
  const t = useTranslations('admin')

  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 text-sm transition-colors"
    >
      <ChevronLeft className="size-4" />
      {t('backToDashboard')}
    </Link>
  )
}
