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
  const { sessions, hydrated, createSession } = useChatSessions(
    userId,
    t('newChatTitle')
  )

  useEffect(() => {
    if (!hydrated) return
    if (!userId) {
      router.replace('/chat/new')
      return
    }

    const run = async () => {
      const empty = sessions.find((s) => s.messageCount === 0)
      if (empty) {
        router.replace(`/chat/${empty.id}`)
        return
      }

      if (sessions.length === 0) {
        const id = await createSession()
        router.replace(`/chat/${id}`)
        return
      }

      router.replace(`/chat/${sessions[0].id}`)
    }

    void run()
  }, [hydrated, userId, sessions, createSession, router])

  return (
    <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
      {t('loading')}
    </div>
  )
}
