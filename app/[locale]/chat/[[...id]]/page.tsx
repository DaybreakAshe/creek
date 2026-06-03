import { Suspense } from 'react'
import { ChatPageContent } from '@/components/chat/ChatPageContent'

/** 供 build 阶段生成静态外壳；真实 id 在运行时由客户端路由处理。 */
const BUILD_PLACEHOLDER_ID = '__placeholder__'

type ChatPageProps = {
  params: Promise<{ locale: string; id?: string[] }>
}

function ChatLoadingFallback() {
  return (
    <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
      ...
    </div>
  )
}

export function generateStaticParams() {
  return [{ id: undefined }, { id: [BUILD_PLACEHOLDER_ID] }]
}

export default function ChatPage({ params }: ChatPageProps) {
  return (
    <Suspense fallback={<ChatLoadingFallback />}>
      <ChatPageRoute params={params} />
    </Suspense>
  )
}

async function ChatPageRoute({ params }: ChatPageProps) {
  const { id: segments } = await params
  const segment = segments?.[0]

  if (segment === BUILD_PLACEHOLDER_ID) {
    return <ChatLoadingFallback />
  }

  if (segment === 'new' || !segment) {
    return <ChatPageContent />
  }

  return <ChatPageContent chatId={segment} />
}
