'use client'

import { DefaultChatTransport } from 'ai'
import type { UIMessage } from '@/lib/chat/types'

export type ChatRequestExtraBody = {
  model?: string
}

const extraBodyRef: { current: ChatRequestExtraBody } = { current: {} }

/** 注入到每次 /api/chat 请求的额外 body 字段（如 model） */
export function setChatRequestExtraBody(body: ChatRequestExtraBody) {
  extraBodyRef.current = body
}

let transport: DefaultChatTransport<UIMessage> | null = null

export function getChatTransport() {
  if (!transport) {
    transport = new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest: ({
        api,
        id,
        messages,
        body,
        headers,
        credentials,
        trigger,
        messageId,
      }) => ({
        api,
        headers,
        credentials,
        body: {
          id,
          messages,
          trigger,
          messageId,
          ...body,
          ...extraBodyRef.current,
        },
      }),
    })
  }
  return transport
}
