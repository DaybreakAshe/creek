import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import { SWRConfig } from 'swr'
import { ThemeProvider } from '@/app/theme-provider'
import { Header } from '@/components/header'
import { DockBox } from '@/components/dock'

export const metadata: Metadata = {
  title: 'Creek',
  description: 'Visuals by Nature, Curated for You',
}

export const viewport: Viewport = {
  maximumScale: 1,
}

const manrope = Manrope({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`bg-white text-black dark:bg-gray-950 dark:text-white ${manrope.className}`}
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh]">
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
      </body>
    </html>
  )
}
