import { NextResponse } from 'next/server'
import { getServerAuthSession } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User, { type PublicUserProfile } from '@/models/user'

export async function GET() {
  try {
    const session = await getServerAuthSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    await connectToDatabase()
    const user = (await User.findOne({ id: session.user.id })
      .select('id name email avatar lastLoginAt')
      .lean()) as PublicUserProfile | null

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取个人信息失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
