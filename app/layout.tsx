import './globals.css'
import type { Metadata, Viewport } from 'next'
import { SWRConfig } from 'swr'
import { ThemeProvider } from '@/app/theme-provider'
import { Header } from '@/components/header'
import { DockBox } from '@/components/dock'
import { ClientSessionProvider } from '@/app/ClientSessionProvider'

export const metadata: Metadata = {
  title: 'Creek',
  description: 'Visuals by Nature, Curated for You',
}

export const viewport: Viewport = {
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="flex h-dvh flex-col overflow-hidden antialiased">
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
      </body>
    </html>
  )
}
