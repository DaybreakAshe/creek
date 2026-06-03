import { setRequestLocale } from 'next-intl/server'
import { HomePageContent } from '@/components/home/HomePageContent'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <HomePageContent />
}
