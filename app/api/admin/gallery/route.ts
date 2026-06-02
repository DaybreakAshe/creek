import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'
import { connectToDatabase } from '@/lib/mongodb'
import { apiError } from '@/lib/api-response'
import {
  ADMIN_PAGE_SIZE,
  buildTextSearchFilter,
  paginateQuery,
  parsePaginationParams,
  parseSearchQuery,
} from '@/lib/pagination/server'
import GalleryItem from '@/models/gallery-item'

const GALLERY_SEARCH_FIELDS = [
  'title',
  'description',
  'creatorName',
  'creatorEmail',
  'userId',
  'originalFilename',
  'mediaFilename',
  'tags',
] as const

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const pagination = parsePaginationParams(searchParams, ADMIN_PAGE_SIZE)
    const search = parseSearchQuery(searchParams)
    const searchFilter = buildTextSearchFilter(search, GALLERY_SEARCH_FIELDS)

    const result = await paginateQuery(GalleryItem, searchFilter, pagination)

    return NextResponse.json(result)
  } catch {
    return apiError('fetchGalleryFailed', 500)
  }
}
