import 'server-only'

import { unstable_cache } from 'next/cache'
import {
  DEFAULT_GEMINI_MODEL_ID,
  FALLBACK_GEMINI_CHAT_MODELS,
  type GeminiChatModelOption,
} from '@/lib/ai/gemini-models'
function getGeminiApiKey(): string | undefined {
  return process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() || undefined
}

const CACHE_REVALIDATE_SECONDS = Math.max(
  300,
  Number(process.env.GEMINI_MODELS_CACHE_SECONDS) || 3600
)

type GoogleModelResource = {
  name: string
  displayName?: string
  supportedGenerationMethods?: string[]
}

type ListModelsResponse = {
  models?: GoogleModelResource[]
  nextPageToken?: string
}

let memoryCatalog: GeminiChatModelOption[] | null = null
let memoryCatalogFetchedAt = 0

function normalizeModelId(name: string): string {
  return name.replace(/^models\//, '')
}

function formatModelDisplayName(id: string): string {
  const core = id.replace(/^gemini-/, '').replace(/-/g, ' ')
  return `Gemini ${core}`
    .split(' ')
    .map((part) => (/^\d/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ')
}

function isChatGeminiModel(id: string, methods: string[] | undefined): boolean {
  if (!methods?.includes('generateContent')) return false
  if (!/^gemini/i.test(id)) return false
  if (/embedding|embed|imagen|aqa|tts|live|computer-use/i.test(id)) return false
  return true
}

function sortChatModels(a: GeminiChatModelOption, b: GeminiChatModelOption): number {
  const score = (id: string) => {
    let s = 0
    if (id.includes('2.5')) s += 100
    else if (id.includes('2.0')) s += 80
    else if (id.includes('1.5')) s += 40
    if (id.includes('flash')) s += 20
    if (id.includes('pro')) s += 10
    return s
  }
  const diff = score(b.id) - score(a.id)
  if (diff !== 0) return diff
  return a.name.localeCompare(b.name)
}

async function fetchModelsFromGoogleApi(): Promise<GeminiChatModelOption[]> {
  const apiKey = getGeminiApiKey()
  if (!apiKey) {
    return FALLBACK_GEMINI_CHAT_MODELS
  }

  const collected: GoogleModelResource[] = []
  let pageToken: string | undefined

  do {
    const url = new URL('https://generativelanguage.googleapis.com/v1beta/models')
    url.searchParams.set('key', apiKey)
    url.searchParams.set('pageSize', '100')
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken)
    }

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(`ListModels failed (${res.status}): ${detail}`)
    }

    const data = (await res.json()) as ListModelsResponse
    collected.push(...(data.models ?? []))
    pageToken = data.nextPageToken
  } while (pageToken)

  const models = collected
    .map((resource) => {
      const id = normalizeModelId(resource.name)
      return {
        id,
        name: resource.displayName?.trim() || formatModelDisplayName(id),
        methods: resource.supportedGenerationMethods,
      }
    })
    .filter((item) => isChatGeminiModel(item.id, item.methods))
    .map(({ id, name }) => ({ id, name }))
    .sort(sortChatModels)

  return models.length > 0 ? models : FALLBACK_GEMINI_CHAT_MODELS
}

const fetchCatalogCached = unstable_cache(
  async () => {
    const models = await fetchModelsFromGoogleApi()
    return {
      models,
      fetchedAt: Date.now(),
    }
  },
  ['gemini-chat-model-catalog'],
  { revalidate: CACHE_REVALIDATE_SECONDS }
)

/** 从 Google ListModels 拉取可 generateContent 的 Gemini 模型，带内存 + Next 缓存 */
export async function getGeminiChatModelCatalog(): Promise<{
  models: GeminiChatModelOption[]
  fetchedAt: number
  fromCache: boolean
}> {
  const now = Date.now()
  if (
    memoryCatalog &&
    now - memoryCatalogFetchedAt < CACHE_REVALIDATE_SECONDS * 1000
  ) {
    return { models: memoryCatalog, fetchedAt: memoryCatalogFetchedAt, fromCache: true }
  }

  try {
    const { models, fetchedAt } = await fetchCatalogCached()
    memoryCatalog = models
    memoryCatalogFetchedAt = fetchedAt
    return { models, fetchedAt, fromCache: false }
  } catch (error) {
    console.error('[gemini-model-catalog] fetch failed:', error)
    if (memoryCatalog) {
      return {
        models: memoryCatalog,
        fetchedAt: memoryCatalogFetchedAt,
        fromCache: true,
      }
    }
    memoryCatalog = FALLBACK_GEMINI_CHAT_MODELS
    memoryCatalogFetchedAt = now
    return {
      models: FALLBACK_GEMINI_CHAT_MODELS,
      fetchedAt: now,
      fromCache: false,
    }
  }
}
