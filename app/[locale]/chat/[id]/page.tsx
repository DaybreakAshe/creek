import { ChatPageContent } from '@/components/chat/ChatPageContent'

type ChatIdPageProps = {
  params: Promise<{ id: string }>
}

export default async function ChatIdPage({ params }: ChatIdPageProps) {
  const { id } = await params
  return <ChatPageContent chatId={id} />
}
