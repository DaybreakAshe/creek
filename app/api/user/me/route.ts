import { NextResponse } from 'next/server'
import { getServerAuthSession } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { getSessionUserId } from '@/lib/session-user'
import { apiError } from '@/lib/api-response'
import User, { type PublicUserProfile } from '@/models/user'

export async function GET() {
  try {
    const session = await getServerAuthSession()
    const sessionUserId = getSessionUserId(session)

    if (!sessionUserId) {
      return apiError('unauthorized', 401)
    }

    await connectToDatabase()
    const user = (await User.findOne({ id: sessionUserId })
      .select('id name email avatar lastLoginAt')
      .lean()) as PublicUserProfile | null

    if (!user) {
      return apiError('userNotFound', 404)
    }

    return NextResponse.json(user)
  } catch {
    return apiError('fetchProfileFailed', 500)
  }
}
