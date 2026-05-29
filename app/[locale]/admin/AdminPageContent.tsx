import { notFound } from 'next/navigation'
import { Shield, Wrench, Users } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getServerAuthSession } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { connectToDatabase } from '@/lib/mongodb'
import User, { type UserInfo } from '@/models/user'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/format-date'
import type { Locale } from '@/i18n/routing'

export async function AdminPageContent() {
  const t = await getTranslations('admin')
  const tCommon = await getTranslations('common')
  const tProfile = await getTranslations('profile')
  const locale = (await getLocale()) as Locale
  const session = await getServerAuthSession()

  if (!session?.user?.id || !isAdmin(session.user.id)) {
    notFound()
  }

  await connectToDatabase()
  const dbUser = (await User.findOne({ id: session.user.id }).lean()) as UserInfo | null
  const userCount = await User.countDocuments()

  return (
    <div className="space-y-8 py-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-orange-500">
          <Shield className="size-5" />
          <span className="text-sm font-medium">{t('label')}</span>
        </div>
        <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
        <p className="text-muted-foreground">
          {t('welcome', {
            name: session.user.name ?? session.user.email ?? '',
          })}
        </p>
      </div>

      <section className="space-y-4 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">{t('currentAccount')}</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">{tProfile('userId')}</dt>
            <dd className="mt-1 font-mono break-all">{session.user.id}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{tProfile('email')}</dt>
            <dd className="mt-1">{session.user.email}</dd>
          </div>
          {dbUser?.lastLoginAt && (
            <div>
              <dt className="text-muted-foreground">{tProfile('lastLogin')}</dt>
              <dd className="mt-1">
                {formatDateTime(dbUser.lastLoginAt, locale)}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t('quickLinks')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/tools"
            className="flex items-start gap-4 rounded-xl border p-5 transition-colors hover:bg-muted/50"
          >
            <Wrench className="mt-0.5 size-5 shrink-0 text-orange-500" />
            <div>
              <p className="font-medium">{t('toolManagement')}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('toolManagementDesc')}
              </p>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="flex items-start gap-4 rounded-xl border p-5 transition-colors hover:bg-muted/50"
          >
            <Users className="mt-0.5 size-5 shrink-0 text-orange-500" />
            <div>
              <p className="font-medium">{t('registeredUsers')}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('registeredUsersDesc', { count: userCount })}
              </p>
            </div>
          </Link>
        </div>
      </section>

      <div>
        <Button variant="outline" asChild>
          <Link href="/">{tCommon('backHome')}</Link>
        </Button>
      </div>
    </div>
  )
}
