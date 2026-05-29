import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'
import { connectToDatabase } from '@/lib/mongodb'
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
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取用户列表失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
