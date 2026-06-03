import 'server-only'

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'

export function getGeminiApiKey(): string | undefined {
  return process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() || undefined
}

export function getGeminiModelId(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL
}

export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey())
}

export function assertGeminiConfigured(): void {
  if (!isGeminiConfigured()) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not configured')
  }
}
