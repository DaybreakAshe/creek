import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { requireAdmin } from '@/lib/require-admin'
import Tool from '@/models/tool'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    await connectToDatabase()
    const tools = await Tool.find({}).sort({ createdAt: -1 })

    return NextResponse.json(tools)
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取工具列表失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
