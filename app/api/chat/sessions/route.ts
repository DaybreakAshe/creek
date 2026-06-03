import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { requireAuth } from '@/lib/require-auth'
import { apiError } from '@/lib/api-response'
import { parsePaginationParams } from '@/lib/pagination/server'
import {
  createChatSession,
  listChatSessions,
} from '@/lib/chat/server'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const pagination = parsePaginationParams(searchParams, 30)
    const result = await listChatSessions(auth.session.user.id, pagination)
    return NextResponse.json(result)
  } catch {
    return apiError('fetchChatSessionsFailed', 500)
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  let body: { sessionId?: string; title?: string }
  try {
    body = await request.json()
  } catch {
    return apiError('invalidRequest', 400)
  }

  const sessionId =
    typeof body.sessionId === 'string' && body.sessionId.trim()
      ? body.sessionId.trim()
      : crypto.randomUUID()
  const title =
    typeof body.title === 'string' && body.title.trim()
      ? body.title.trim()
      : 'New chat'

  try {
    await connectToDatabase()
    const session = await createChatSession(
      auth.session.user.id,
      sessionId,
      title
    )
    return NextResponse.json(session, { status: 201 })
  } catch {
    return apiError('createChatSessionFailed', 500)
  }
}
