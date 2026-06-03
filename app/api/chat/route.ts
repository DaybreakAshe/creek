import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from 'ai'
import { getGeminiModelId, isGeminiConfigured } from '@/lib/ai/config'
import { getGoogleProvider } from '@/lib/ai/google'
import { apiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/require-auth'

export const maxDuration = 60

const CHAT_SYSTEM_PROMPT = `你是 Creek 网站的 AI 助手，友好、简洁、准确。
请用用户使用的语言回复（中文或英文）。
若问题与网站无关，可礼貌说明并尝试提供有用信息。`

export async function POST(req: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  if (!isGeminiConfigured()) {
    return apiError('aiNotConfigured', 503)
  }

  let body: { messages?: UIMessage[] }
  try {
    body = await req.json()
  } catch {
    return apiError('invalidRequest', 400)
  }

  const { messages } = body
  if (!Array.isArray(messages) || messages.length === 0) {
    return apiError('invalidRequest', 400)
  }

  try {
    const google = getGoogleProvider()
    const result = streamText({
      model: google(getGeminiModelId()),
      system: CHAT_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
  } catch {
    return apiError('chatFailed', 500)
  }
}
