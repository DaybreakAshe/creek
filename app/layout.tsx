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
    <html
      lang="en"
      className="bg-white text-black dark:bg-gray-950 dark:text-white"
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh]">
        <ClientSessionProvider>
          <SWRConfig>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Header />
              <div className="container mx-auto mt-16">{children}</div>
              <DockBox />
            </ThemeProvider>
          </SWRConfig>
        </ClientSessionProvider>
      </body>
    </html>
  )
}
