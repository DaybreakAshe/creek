import { NextResponse } from 'next/server'
import type { UIMessage } from '@/lib/chat/types'
import { connectToDatabase } from '@/lib/mongodb'
import { requireAuth } from '@/lib/require-auth'
import { apiError } from '@/lib/api-response'
import { parsePaginationParams } from '@/lib/pagination/server'
import { listChatMessages, replaceChatMessages } from '@/lib/chat/server'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await context.params
  if (!id?.trim()) {
    return apiError('invalidChatSessionId', 400)
  }

  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const pagination = parsePaginationParams(searchParams, 50)
    const order = searchParams.get('order') === 'desc' ? 'desc' : 'asc'
    const result = await listChatMessages(
      auth.session.user.id,
      id,
      pagination,
      order
    )

    if (!result) {
      return apiError('chatSessionNotFound', 404)
    }

    return NextResponse.json(result)
  } catch {
    return apiError('fetchChatMessagesFailed', 500)
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await context.params
  if (!id?.trim()) {
    return apiError('invalidChatSessionId', 400)
  }

  let body: { messages?: UIMessage[]; fallbackTitle?: string }
  try {
    body = await request.json()
  } catch {
    return apiError('invalidRequest', 400)
  }

  if (!Array.isArray(body.messages)) {
    return apiError('invalidRequest', 400)
  }

  const fallbackTitle =
    typeof body.fallbackTitle === 'string' && body.fallbackTitle.trim()
      ? body.fallbackTitle.trim()
      : 'New chat'

  try {
    await connectToDatabase()
    const session = await replaceChatMessages(
      auth.session.user.id,
      id,
      body.messages,
      fallbackTitle
    )

    if (!session) {
      return apiError('chatSessionNotFound', 404)
    }

    return NextResponse.json(session)
  } catch {
    return apiError('saveChatMessagesFailed', 500)
  }
}
