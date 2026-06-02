import { NextResponse } from 'next/server'
import { getServerAuthSession } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { apiError } from '@/lib/api-response'
import { publicGalleryFilter } from '@/lib/gallery-auth'
import { parseGalleryType, parseTagsInput } from '@/lib/gallery-form'
import { parseFileExtension } from '@/lib/format-file-size'
import { connectToDatabase } from '@/lib/mongodb'
import { requireAuth } from '@/lib/require-auth'
import { getSessionUserId, isSessionUser } from '@/lib/session-user'
import {
  ADMIN_PAGE_SIZE,
  buildTextSearchFilter,
  paginateQuery,
  parsePaginationParams,
  parseSearchQuery,
} from '@/lib/pagination/server'
import GalleryItem from '@/models/gallery-item'

const DEFAULT_LIST_LIMIT = 100

const GALLERY_SEARCH_FIELDS = [
  'title',
  'description',
  'creatorName',
  'creatorEmail',
  'originalFilename',
  'mediaFilename',
  'tags',
] as const

export async function GET(request: Request) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (userId) {
      const session = await getServerAuthSession()
      const sessionUserId = getSessionUserId(session)

      if (!sessionUserId) {
        return apiError('unauthorized', 401)
      }

      const isSelf = isSessionUser(session, userId)
      const isAdminUser = isAdmin(sessionUserId)

      if (!isSelf && !isAdminUser) {
        return apiError('forbidden', 403)
      }

      const ownerId = isSelf ? sessionUserId : userId
      const pagination = parsePaginationParams(searchParams, ADMIN_PAGE_SIZE)
      const search = parseSearchQuery(searchParams)
      const searchFilter = buildTextSearchFilter(search, GALLERY_SEARCH_FIELDS)

      const result = await paginateQuery(
        GalleryItem,
        { userId: ownerId, ...searchFilter },
        pagination
      )

      return NextResponse.json(result)
    }

    const limitParam = searchParams.get('limit')
    const limit = Math.min(
      Math.max(Number(limitParam) || DEFAULT_LIST_LIMIT, 1),
      200
    )

    const items = await GalleryItem.find(publicGalleryFilter)
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

    const originalFilename =
      typeof body.originalFilename === 'string'
        ? body.originalFilename.trim()
        : typeof body.mediaFilename === 'string'
          ? body.mediaFilename.split('/').pop()?.trim() ?? ''
          : ''

    const fileSize =
      typeof body.fileSize === 'number' && body.fileSize >= 0
        ? body.fileSize
        : Number(body.fileSize) >= 0
          ? Number(body.fileSize)
          : 0

    const fileExtension =
      typeof body.fileExtension === 'string' && body.fileExtension.trim()
        ? body.fileExtension.trim().toLowerCase()
        : parseFileExtension(originalFilename)

    await connectToDatabase()

    const altText =
      typeof body.altText === 'string' ? body.altText.trim() : ''

    const item = await GalleryItem.create({
      userId: sessionUserId,
      creatorName:
        auth.session.user?.name?.trim() ||
        auth.session.user?.email?.trim() ||
        '',
      creatorEmail: auth.session.user?.email?.trim() || '',
      title,
      description:
        typeof body.description === 'string' ? body.description.trim() : '',
      type,
      mediaUrl,
      mediaFilename:
        typeof body.mediaFilename === 'string' ? body.mediaFilename.trim() : '',
      mimeType:
        typeof body.mimeType === 'string' ? body.mimeType.trim() : '',
      originalFilename,
      fileExtension,
      fileSize,
      tags: Array.isArray(body.tags)
        ? body.tags.filter((tag): tag is string => typeof tag === 'string')
        : parseTagsInput(typeof body.tags === 'string' ? body.tags : ''),
      altText: altText || title,
      linkUrl:
        typeof body.linkUrl === 'string' ? body.linkUrl.trim() : '',
      isPublic: body.isPublic !== false,
    })

    return NextResponse.json(item, { status: 201 })
  } catch {
    return apiError('createGalleryFailed', 500)
  }
}
