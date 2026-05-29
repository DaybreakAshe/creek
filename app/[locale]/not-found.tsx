import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { CircleIcon } from 'lucide-react'

export default function NotFound() {
  const t = useTranslations('notFound')

  return (
    <div className="flex min-h-[100dvh] items-center justify-center">
      <div className="max-w-md space-y-8 p-4 text-center">
        <div className="flex justify-center">
          <CircleIcon className="size-12 text-orange-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground text-base">{t('description')}</p>
        <Link
          href="/"
          className="border-input bg-background hover:bg-accent hover:text-accent-foreground mx-auto flex max-w-48 justify-center rounded-full border px-4 py-2 text-sm font-medium shadow-sm"
        >
          {t('backHome')}
        </Link>
      </div>
    </div>
  )
}
