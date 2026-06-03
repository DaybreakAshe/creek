import { isTextUIPart, type UIMessage } from 'ai'

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join('')
}

export function deriveChatTitle(messages: UIMessage[], fallback: string): string {
  const firstUser = messages.find((m) => m.role === 'user')
  if (!firstUser) return fallback

  const text = getMessageText(firstUser).trim()
  if (!text) return fallback

  return text.length > 32 ? `${text.slice(0, 32)}…` : text
}
