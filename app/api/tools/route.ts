import { NextResponse } from 'next/server'
import { getServerAuthSession } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { connectToDatabase } from '@/lib/mongodb'
import { getSessionUserId, isSessionUser } from '@/lib/session-user'
import { publicToolsFilter } from '@/lib/tool-auth'
import { requireAuth } from '@/lib/require-auth'
import Tool from '@/models/tool'

const writableFields = [
  'name',
  'url',
  'description',
  'icon',
  'category',
  'isPublic',
] as const

function pickWritableFields(body: Record<string, unknown>) {
  return Object.fromEntries(
    writableFields
      .filter((key) => key in body)
      .map((key) => [key, body[key]])
  )
}

export async function GET(request: Request) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (userId) {
      const session = await getServerAuthSession()
      const sessionUserId = getSessionUserId(session)

      if (!sessionUserId) {
        return NextResponse.json({ error: '未登录' }, { status: 401 })
      }

      const isSelf = isSessionUser(session, userId)
      const isAdminUser = isAdmin(sessionUserId)

      if (!isSelf && !isAdminUser) {
        return NextResponse.json({ error: '无权限' }, { status: 403 })
      }

      const ownerId = isSelf ? sessionUserId : userId
      const tools = await Tool.find({ userId: ownerId }).sort({ createdAt: -1 })

      return NextResponse.json(tools)
    }

    const tools = await Tool.find(publicToolsFilter).sort({ createdAt: -1 })
    return NextResponse.json(tools)
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取工具列表失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth()
    if (auth.error) return auth.error

    const sessionUserId = getSessionUserId(auth.session)
    if (!sessionUserId) {
      return NextResponse.json({ error: '无法识别用户身份' }, { status: 401 })
    }

    await connectToDatabase()
    const body = ((await request.json()) ?? {}) as Record<string, unknown>
    const data = pickWritableFields(body)

    const tool = await Tool.create({
      ...data,
      userId: sessionUserId,
      isPublic: Boolean(data.isPublic),
    })

    return NextResponse.json(tool, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : '创建工具失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
