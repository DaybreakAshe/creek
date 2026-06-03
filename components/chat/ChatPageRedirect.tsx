'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { useChatSessionsContext } from '@/components/chat/ChatSessionsProvider'

export function ChatPageRedirect() {
  const t = useTranslations('chat')
  const router = useRouter()
  const { data: session } = useSession()
  const userId = session?.user?.id
  const redirectedRef = useRef(false)
  const { sessions, hydrated, createSession } = useChatSessionsContext()
  const sessionsRef = useRef(sessions)
  sessionsRef.current = sessions

  useEffect(() => {
    if (!hydrated || redirectedRef.current) return

    redirectedRef.current = true

    if (!userId) {
      router.replace('/chat/new')
      return
    }

    const run = async () => {
      const list = sessionsRef.current
      const empty = list.find((s) => s.messageCount === 0)
      if (empty) {
        router.replace(`/chat/${empty.id}`)
        return
      }

      if (list.length === 0) {
        const id = await createSession()
        router.replace(`/chat/${id}`)
        return
      }

      router.replace(`/chat/${list[0].id}`)
    }

    void run()
  }, [hydrated, userId, createSession, router])

  return (
    <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
      {t('loading')}
    </div>
  )
}
