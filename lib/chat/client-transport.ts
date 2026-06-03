'use client'

import { DefaultChatTransport } from 'ai'
import type { UIMessage } from '@/lib/chat/types'

let transport: DefaultChatTransport<UIMessage> | null = null

export function getChatTransport() {
  if (!transport) {
    transport = new DefaultChatTransport({ api: '/api/chat' })
  }
  return transport
}
