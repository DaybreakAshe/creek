/** 聊天可选 Gemini 模型（客户端/服务端共用） */
export type GeminiChatModelOption = {
  id: string
  name: string
}

export const DEFAULT_GEMINI_MODEL_ID = 'gemini-2.5-flash'

/** API 不可用时的兜底列表（不含已下线模型） */
export const FALLBACK_GEMINI_CHAT_MODELS: GeminiChatModelOption[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
]

export function parseGeminiModelsEnv(raw: string | undefined): string[] | null {
  if (!raw?.trim()) return null
  const ids = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return ids.length > 0 ? ids : null
}
