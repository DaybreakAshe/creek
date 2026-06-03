import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { requireAuth } from '@/lib/require-auth'
import { apiError } from '@/lib/api-response'
import { deleteChatSession, getChatSessionForUser } from '@/lib/chat/server'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await context.params
  if (!id?.trim()) {
    return apiError('invalidChatSessionId', 400)
  }

  try {
    await connectToDatabase()
    const session = await getChatSessionForUser(auth.session.user.id, id)
    if (!session) {
      return apiError('chatSessionNotFound', 404)
    }
    return NextResponse.json(session)
  } catch {
    return apiError('fetchChatSessionsFailed', 500)
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await context.params
  if (!id?.trim()) {
    return apiError('invalidChatSessionId', 400)
  }

  try {
    await connectToDatabase()
    const deleted = await deleteChatSession(auth.session.user.id, id)
    if (!deleted) {
      return apiError('chatSessionNotFound', 404)
    }
    return NextResponse.json({ ok: true })
  } catch {
    return apiError('deleteChatSessionFailed', 500)
  }
}
