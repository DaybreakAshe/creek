import { Suspense } from 'react'
import { setRequestLocale } from 'next-intl/server'
import { AuthErrorContent } from './AuthErrorContent'

function AuthErrorFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-muted-foreground">...</p>
    </div>
  )
}

export default function AuthErrorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <Suspense fallback={<AuthErrorFallback />}>
      <AuthErrorPageContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function AuthErrorPageContent({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const resolvedSearchParams = await searchParams

  return <AuthErrorContent error={resolvedSearchParams.error || null} />
}
