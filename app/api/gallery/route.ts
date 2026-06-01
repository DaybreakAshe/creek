import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-response'
import {
  inferGalleryTypeFromMime,
  parseGalleryType,
  parseTagsInput,
} from '@/lib/gallery-form'
import { connectToDatabase } from '@/lib/mongodb'
import { requireAuth } from '@/lib/require-auth'
import { getSessionUserId } from '@/lib/session-user'
import {
  buildUploadPath,
  getSirvConfig,
  uploadToSirv,
} from '@/lib/sirv'
import GalleryItem from '@/models/gallery-item'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const GALLERY_FOLDER = '/creek/gallery'
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

    if (!getSirvConfig()) {
      return apiError('sirvNotConfigured', 503)
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const title = formData.get('title')

    if (!file || !(file instanceof File)) {
      return apiError('fileRequired', 400)
    }

    if (typeof title !== 'string' || !title.trim()) {
      return apiError('titleRequired', 400)
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError('fileTooLarge', 413)
    }

    const mimeType = file.type || 'application/octet-stream'
    const explicitType = parseGalleryType(formData.get('type'))
    const type = explicitType ?? inferGalleryTypeFromMime(mimeType)

    const description =
      typeof formData.get('description') === 'string'
        ? formData.get('description')!.toString().trim()
        : ''
    const altText =
      typeof formData.get('altText') === 'string'
        ? formData.get('altText')!.toString().trim()
        : ''
    const linkUrl =
      typeof formData.get('linkUrl') === 'string'
        ? formData.get('linkUrl')!.toString().trim()
        : ''
    const tagsRaw =
      typeof formData.get('tags') === 'string' ? formData.get('tags')!.toString() : ''
    const tags = parseTagsInput(tagsRaw)
    const isPublic = formData.get('isPublic') !== 'false'

    const buffer = Buffer.from(await file.arrayBuffer())
    const sirvPath = buildUploadPath(file.name, GALLERY_FOLDER)
    const upload = await uploadToSirv(buffer, {
      filename: sirvPath,
      contentType: mimeType,
    })

    await connectToDatabase()

    const item = await GalleryItem.create({
      userId: sessionUserId,
      title: title.trim(),
      description,
      type,
      mediaUrl: upload.url,
      mediaFilename: upload.filename,
      mimeType,
      tags,
      altText: altText || title.trim(),
      linkUrl,
      isPublic,
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'SIRV_NOT_CONFIGURED') {
      return apiError('sirvNotConfigured', 503)
    }
    return apiError('createGalleryFailed', 500)
  }
}
