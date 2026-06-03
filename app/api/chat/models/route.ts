import { NextResponse } from 'next/server'
import { getGeminiChatModelCatalog } from '@/lib/ai/gemini-model-catalog'
import {
  getAllowedGeminiChatModels,
  getDefaultGeminiModelId,
  isGeminiConfigured,
} from '@/lib/ai/config'
import { apiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/require-auth'

export async function GET() {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  if (!isGeminiConfigured()) {
    return apiError('aiNotConfigured', 503)
  }

  const [models, defaultModelId, catalog] = await Promise.all([
    getAllowedGeminiChatModels(),
    getDefaultGeminiModelId(),
    getGeminiChatModelCatalog(),
  ])

  return NextResponse.json({
    defaultModelId,
    models,
    fetchedAt: catalog.fetchedAt,
    fromCache: catalog.fromCache,
  })
}
