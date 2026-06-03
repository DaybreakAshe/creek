import { CHAT_ASSISTANT_AVATAR_URL } from '@/lib/chat/constants'

const preloaded = new Set<string>()

export function preloadAvatarUrl(url: string | undefined | null) {
  if (!url || typeof window === 'undefined' || preloaded.has(url)) return
  preloaded.add(url)
  const img = new Image()
  img.src = url
}

export function preloadChatAvatars(userAvatarUrl?: string | null) {
  preloadAvatarUrl(CHAT_ASSISTANT_AVATAR_URL)
  preloadAvatarUrl(userAvatarUrl)
}
