import { cn } from '@/lib/utils'

/** 输入框宽度（Tailwind max-w-3xl = 48rem） */
export const CHAT_INPUT_MAX_W = 'max-w-3xl'

/** 消息列略宽于输入框，Gemini 式居中栏 */
export const CHAT_MESSAGES_MAX_W = 'max-w-[53rem]'

export function chatMessagesColumnClass(className?: string) {
  return cn('mx-auto w-full min-w-0', CHAT_MESSAGES_MAX_W, 'px-4 sm:px-6', className)
}

export function chatInputColumnClass(className?: string) {
  return cn('mx-auto w-full min-w-0', CHAT_INPUT_MAX_W, className)
}
