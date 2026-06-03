import { MainContent } from '@/components/layout/MainContent'

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <MainContent variant="full" className="h-full min-h-0">
      {children}
    </MainContent>
  )
}
