import { Suspense } from 'react'
import { setRequestLocale } from 'next-intl/server'
import { AdminPageContent } from './AdminPageContent'

function AdminLoadingFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-muted-foreground">...</p>
    </div>
  )
}

export default function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <AdminPageWrapper params={params} />
    </Suspense>
  )
}

async function AdminPageWrapper({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <AdminPageContent />
}
