import { Suspense } from 'react'
import { ChatPageContent } from '@/components/chat/ChatPageContent'

/** 供 build 阶段生成静态外壳；真实 id 在运行时由客户端路由处理。 */
const BUILD_PLACEHOLDER_ID = '__placeholder__'

type ChatIdPageProps = {
  params: Promise<{ locale: string; id: string }>
}

function ChatLoadingFallback() {
  return (
    <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
      ...
    </div>
  )
}

export function generateStaticParams() {
  return [{ id: BUILD_PLACEHOLDER_ID }]
}

export default function ChatIdPage({ params }: ChatIdPageProps) {
  return (
    <Suspense fallback={<ChatLoadingFallback />}>
      <ChatIdPageInner params={params} />
    </Suspense>
  )
}

async function ChatIdPageInner({ params }: ChatIdPageProps) {
  const { id } = await params

  if (id === BUILD_PLACEHOLDER_ID) {
    return <ChatLoadingFallback />
  }

  return <ChatPageContent chatId={id} />
}
