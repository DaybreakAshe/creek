import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'
import { connectToDatabase } from '@/lib/mongodb'
import { apiError } from '@/lib/api-response'
import User, { type PublicUserProfile } from '@/models/user'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    await connectToDatabase()
    const users = (await User.find({})
      .select('id name email avatar lastLoginAt')
      .sort({ lastLoginAt: -1 })
      .lean()) as unknown as PublicUserProfile[]

    return NextResponse.json(users)
  } catch {
    return apiError('fetchUsersFailed', 500)
  }
}
