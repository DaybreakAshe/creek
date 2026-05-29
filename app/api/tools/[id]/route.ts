import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { canManageTool } from '@/lib/tool-auth'
import { requireAuth } from '@/lib/require-auth'
import { getSessionUserId } from '@/lib/session-user'
import { apiError } from '@/lib/api-response'
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
      return apiError('invalidToolId', 400)
    }

    await connectToDatabase()
    const existing = await Tool.findById(id)
    if (!existing) {
      return apiError('toolNotFound', 404)
    }

    if (!canManageTool(existing, getSessionUserId(auth.session))) {
      return apiError('forbidden', 403)
    }

    const body = ((await request.json()) ?? {}) as Record<string, unknown>
    const data = pickWritableFields(body)

    const tool = await Tool.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    )

    return NextResponse.json(tool)
  } catch {
    return apiError('updateToolFailed', 500)
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
      return apiError('invalidToolId', 400)
    }

    await connectToDatabase()
    const existing = await Tool.findById(id)
    if (!existing) {
      return apiError('toolNotFound', 404)
    }

    if (!canManageTool(existing, getSessionUserId(auth.session))) {
      return apiError('forbidden', 403)
    }

    await Tool.findByIdAndDelete(id)

    return NextResponse.json({ message: 'ok' })
  } catch {
    return apiError('deleteToolFailed', 500)
  }
}
