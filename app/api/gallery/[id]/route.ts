import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectToDatabase } from '@/lib/mongodb'
import { canManageGalleryItem } from '@/lib/gallery-auth'
import { parseTagsInput } from '@/lib/gallery-form'
import { requireAuth } from '@/lib/require-auth'
import { getSessionUserId } from '@/lib/session-user'
import { apiError } from '@/lib/api-response'
import GalleryItem from '@/models/gallery-item'

const writableFields = [
  'title',
  'description',
  'altText',
  'linkUrl',
  'isPublic',
  'tags',
] as const

function pickWritableFields(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {}

  for (const key of writableFields) {
    if (!(key in body)) continue
    if (key === 'tags') {
      data.tags = Array.isArray(body.tags)
        ? body.tags.filter((tag): tag is string => typeof tag === 'string')
        : parseTagsInput(typeof body.tags === 'string' ? body.tags : '')
      continue
    }
    if (key === 'isPublic') {
      data.isPublic = body.isPublic !== false
      continue
    }
    if (typeof body[key] === 'string') {
      data[key] = body[key].trim()
    }
  }

  return data
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
      return apiError('invalidGalleryId', 400)
    }

    await connectToDatabase()
    const existing = await GalleryItem.findById(id)
    if (!existing) {
      return apiError('galleryNotFound', 404)
    }

    if (!canManageGalleryItem(existing, getSessionUserId(auth.session))) {
      return apiError('forbidden', 403)
    }

    const body = ((await request.json()) ?? {}) as Record<string, unknown>
    const data = pickWritableFields(body)

    const item = await GalleryItem.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    )

    return NextResponse.json(item)
  } catch {
    return apiError('updateGalleryFailed', 500)
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth()
    if (auth.error) return auth.error

    const { id } = await context.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError('invalidGalleryId', 400)
    }

    await connectToDatabase()
    const existing = await GalleryItem.findById(id)
    if (!existing) {
      return apiError('galleryNotFound', 404)
    }

    if (!canManageGalleryItem(existing, getSessionUserId(auth.session))) {
      return apiError('forbidden', 403)
    }

    await GalleryItem.findByIdAndDelete(id)

    return NextResponse.json({ ok: true })
  } catch {
    return apiError('deleteGalleryFailed', 500)
  }
}
