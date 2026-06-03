import type { UIMessage } from '@/lib/chat/types'

/** AI SDK 流式协议用的步骤标记，无展示内容，可忽略。 */
const IGNORABLE_PART_TYPES = new Set(['step-start'])

/** 可在 UI 中展示或已单独渲染的 part 类型。 */
const SUPPORTED_PART_TYPES = new Set(['text', 'reasoning'])

export function isIgnorablePart(part: UIMessage['parts'][number]): boolean {
  return IGNORABLE_PART_TYPES.has(part.type)
}

export function isSupportedPart(part: UIMessage['parts'][number]): boolean {
  if (isIgnorablePart(part)) return true
  return SUPPORTED_PART_TYPES.has(part.type)
}

export function hasUnsupportedParts(message: UIMessage): boolean {
  return message.parts.some((part) => !isSupportedPart(part))
}

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => ('text' in part ? String(part.text) : ''))
    .join('')
}

export function getMessageReasoning(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'reasoning')
    .map((part) => ('text' in part ? String(part.text) : ''))
    .join('\n\n')
    .trim()
}

/** 持久化时去掉无意义的协议 part，减小体积。 */
export function normalizeMessagesForStorage(messages: UIMessage[]): UIMessage[] {
  return messages.map((message) => ({
    ...message,
    parts: message.parts.filter(
      (part) => part.type === 'text' || part.type === 'reasoning'
    ),
  }))
}

export function deriveChatTitle(messages: UIMessage[], fallback: string): string {
  const firstUser = messages.find((m) => m.role === 'user')
  if (!firstUser) return fallback

  const text = getMessageText(firstUser).trim()
  if (!text) return fallback

  return text.length > 32 ? `${text.slice(0, 32)}…` : text
}
