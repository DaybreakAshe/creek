import 'server-only'

import { getGeminiChatModelCatalog } from '@/lib/ai/gemini-model-catalog'
import {
  DEFAULT_GEMINI_MODEL_ID,
  parseGeminiModelsEnv,
  type GeminiChatModelOption,
} from '@/lib/ai/gemini-models'

export function getGeminiApiKey(): string | undefined {
  return process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() || undefined
}

export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey())
}

export function assertGeminiConfigured(): void {
  if (!isGeminiConfigured()) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not configured')
  }
}

function applyEnvModelFilter(
  catalog: GeminiChatModelOption[]
): GeminiChatModelOption[] {
  const envIds = parseGeminiModelsEnv(process.env.GEMINI_MODELS)
  if (!envIds) return catalog
  const allowed = new Set(envIds)
  const filtered = catalog.filter((m) => allowed.has(m.id))
  return filtered.length > 0 ? filtered : catalog
}

export function pickDefaultGeminiModelId(
  allowed: GeminiChatModelOption[]
): string {
  const allowedIds = new Set(allowed.map((m) => m.id))
  const fromEnv = process.env.GEMINI_MODEL?.trim()
  if (fromEnv && allowedIds.has(fromEnv)) {
    return fromEnv
  }
  if (allowedIds.has(DEFAULT_GEMINI_MODEL_ID)) {
    return DEFAULT_GEMINI_MODEL_ID
  }
  const flash = allowed.find((m) => m.id.includes('flash'))
  return flash?.id ?? allowed[0]?.id ?? DEFAULT_GEMINI_MODEL_ID
}

export async function getAllowedGeminiChatModels(): Promise<GeminiChatModelOption[]> {
  const { models } = await getGeminiChatModelCatalog()
  return applyEnvModelFilter(models)
}

export async function getDefaultGeminiModelId(): Promise<string> {
  const allowed = await getAllowedGeminiChatModels()
  return pickDefaultGeminiModelId(allowed)
}

/** 校验并解析请求中的模型 id，非法时回退默认 */
export async function resolveGeminiModelId(requested?: string): Promise<string> {
  const allowed = await getAllowedGeminiChatModels()
  const allowedIds = new Set(allowed.map((m) => m.id))
  const id = requested?.trim()
  if (id && allowedIds.has(id)) {
    return id
  }
  return pickDefaultGeminiModelId(allowed)
}
