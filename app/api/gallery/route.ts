import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-response'
import { parseGalleryType, parseTagsInput } from '@/lib/gallery-form'
import { connectToDatabase } from '@/lib/mongodb'
import { requireAuth } from '@/lib/require-auth'
import { getSessionUserId } from '@/lib/session-user'
import GalleryItem from '@/models/gallery-item'
const DEFAULT_LIST_LIMIT = 100

export async function GET(request: Request) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = Math.min(
      Math.max(Number(limitParam) || DEFAULT_LIST_LIMIT, 1),
      200
    )

    const items = await GalleryItem.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json(items)
  } catch {
    return apiError('fetchGalleryFailed', 500)
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth()
    if (auth.error) return auth.error

    const sessionUserId = getSessionUserId(auth.session)
    if (!sessionUserId) {
      return apiError('userIdentityUnknown', 401)
    }

    const body = (await request.json()) as Record<string, unknown>
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const mediaUrl = typeof body.mediaUrl === 'string' ? body.mediaUrl.trim() : ''

    if (!title) {
      return apiError('titleRequired', 400)
    }

    if (!mediaUrl) {
      return apiError('mediaUrlRequired', 400)
    }

    const type = parseGalleryType(
      typeof body.type === 'string' ? body.type : null
    )
    if (!type) {
      return apiError('invalidGalleryType', 400)
    }

    const description =
      typeof body.description === 'string' ? body.description.trim() : ''
    const altText =
      typeof body.altText === 'string' ? body.altText.trim() : ''
    const linkUrl =
      typeof body.linkUrl === 'string' ? body.linkUrl.trim() : ''
    const mediaFilename =
      typeof body.mediaFilename === 'string' ? body.mediaFilename.trim() : ''
    const mimeType =
      typeof body.mimeType === 'string' ? body.mimeType.trim() : ''
    const tags = Array.isArray(body.tags)
      ? body.tags.filter((tag): tag is string => typeof tag === 'string')
      : parseTagsInput(typeof body.tags === 'string' ? body.tags : '')
    const isPublic = body.isPublic !== false

    await connectToDatabase()

    const item = await GalleryItem.create({
      userId: sessionUserId,
      title,
      description,
      type,
      mediaUrl,
      mediaFilename,
      mimeType,
      tags,
      altText: altText || title,
      linkUrl,
      isPublic,
    })

    return NextResponse.json(item, { status: 201 })
  } catch {
    return apiError('createGalleryFailed', 500)
  }
}
