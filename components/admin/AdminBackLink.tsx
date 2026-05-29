import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface AdminBackLinkProps {
  href?: string
  label?: string
}

export function AdminBackLink({
  href = '/admin',
  label = '返回管理后台',
}: AdminBackLinkProps) {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 text-sm transition-colors"
    >
      <ChevronLeft className="size-4" />
      {label}
    </Link>
  )
}
