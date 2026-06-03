import { DefaultChatTransport } from 'ai'

export const chatTransport = new DefaultChatTransport({
  api: '/api/chat',
})
