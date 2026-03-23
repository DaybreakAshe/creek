import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Tool from '@/models/tool'

export async function GET() {
  try {
    await connectToDatabase()
    const tools = await Tool.find({}).sort({ createdAt: -1 })
    return NextResponse.json(tools)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase()
    const body = (await request.json()) ?? {}
    // 避免把前端返回的不可写字段带入创建请求
    const { _id, createdAt, updatedAt, ...rest } = body
    const tool = await Tool.create(rest)
    return NextResponse.json(tool, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
