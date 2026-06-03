import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from 'ai'
import { isGeminiConfigured, resolveGeminiModelId } from '@/lib/ai/config'
import { getGoogleProvider } from '@/lib/ai/google'
import { buildChatSystemPrompt } from '@/lib/chat/rag-context'
import { apiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/require-auth'

export const maxDuration = 60

export async function POST(req: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  if (!isGeminiConfigured()) {
    return apiError('aiNotConfigured', 503)
  }

  let body: { messages?: UIMessage[]; model?: string }
  try {
    body = await req.json()
  } catch {
    return apiError('invalidRequest', 400)
  }

  const { messages, model: requestedModel } = body
  if (!Array.isArray(messages) || messages.length === 0) {
    return apiError('invalidRequest', 400)
  }

  try {
    const google = getGoogleProvider()
    const modelId = await resolveGeminiModelId(requestedModel)
    const result = streamText({
      model: google(modelId),
      system: buildChatSystemPrompt(),
      messages: await convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
  } catch {
    return apiError('chatFailed', 500)
  }
}
