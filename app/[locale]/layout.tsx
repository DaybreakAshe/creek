import '../globals.css'
import type { Viewport } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from 'next-intl/server'
import { SWRConfig } from 'swr'
import { ThemeProvider } from '@/app/theme-provider'
import { Header } from '@/components/header'
import { DockBox } from '@/components/dock'
import { ClientSessionProvider } from '@/app/ClientSessionProvider'
import { routing } from '@/i18n/routing'

export const viewport: Viewport = {
  maximumScale: 1,
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <body className="flex h-dvh flex-col overflow-hidden antialiased">
        <NextIntlClientProvider messages={messages}>
          <ClientSessionProvider>
            <SWRConfig>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <Header />
                <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  <div className="container mx-auto px-3 py-4">{children}</div>
                </main>
                <DockBox />
              </ThemeProvider>
            </SWRConfig>
          </ClientSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
