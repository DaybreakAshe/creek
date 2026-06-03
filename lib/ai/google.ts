import 'server-only'

import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { assertGeminiConfigured, getGeminiApiKey } from '@/lib/ai/config'

let googleProvider: ReturnType<typeof createGoogleGenerativeAI> | null = null

export function getGoogleProvider() {
  assertGeminiConfigured()

  if (!googleProvider) {
    const apiKey = getGeminiApiKey()
    googleProvider = createGoogleGenerativeAI({ apiKey: apiKey! })
  }

  return googleProvider
}
