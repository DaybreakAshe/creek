'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { useChatSessions } from '@/hooks/use-chat-sessions'

export function ChatPageRedirect() {
  const t = useTranslations('chat')
  const router = useRouter()
  const { data: session } = useSession()
  const userId = session?.user?.id
  const { sessions, activeId, hydrated, createSession } = useChatSessions(
    userId,
    t('newChatTitle')
  )

  useEffect(() => {
    if (!hydrated) return
    if (!userId) {
      router.replace('/chat/new')
      return
    }

    if (sessions.length === 0) {
      const id = createSession()
      router.replace(`/chat/${id}`)
      return
    }

    const targetId =
      activeId && sessions.some((s) => s.id === activeId)
        ? activeId
        : sessions[0].id
    router.replace(`/chat/${targetId}`)
  }, [hydrated, userId, sessions, activeId, createSession, router])

  return (
    <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
      {t('loading')}
    </div>
  )
}
