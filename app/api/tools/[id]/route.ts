import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { canManageTool } from '@/lib/tool-auth'
import { requireAuth } from '@/lib/require-auth'
import Tool from '@/models/tool'
import mongoose from 'mongoose'

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

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth()
    if (auth.error) return auth.error

    const { id } = await context.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid tool id' }, { status: 400 })
    }

    await connectToDatabase()
    const existing = await Tool.findById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    if (!canManageTool(existing, auth.session.user.id)) {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    const body = ((await request.json()) ?? {}) as Record<string, unknown>
    const data = pickWritableFields(body)

    const tool = await Tool.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    )

    return NextResponse.json(tool)
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新工具失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth()
    if (auth.error) return auth.error

    const { id } = await context.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid tool id' }, { status: 400 })
    }

    await connectToDatabase()
    const existing = await Tool.findById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    if (!canManageTool(existing, auth.session.user.id)) {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    await Tool.findByIdAndDelete(id)

    return NextResponse.json({ message: 'Tool deleted successfully' })
  } catch (error) {
    const message = error instanceof Error ? error.message : '删除工具失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
