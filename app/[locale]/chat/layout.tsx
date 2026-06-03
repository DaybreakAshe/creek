import { MainContent } from '@/components/layout/MainContent'
import { ChatSessionsProvider } from '@/components/chat/ChatSessionsProvider'

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <MainContent variant="full" className="h-full min-h-0">
      <ChatSessionsProvider>{children}</ChatSessionsProvider>
    </MainContent>
  )
}
