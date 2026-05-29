import { getTranslations, setRequestLocale } from 'next-intl/server'

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('about')

  return <div>{t('title')}</div>
}
