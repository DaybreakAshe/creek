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
import User, { type PublicUserProfile } from '@/models/user'

const USER_SEARCH_FIELDS = ['name', 'email', 'id'] as const

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const pagination = parsePaginationParams(searchParams, ADMIN_PAGE_SIZE)
    const search = parseSearchQuery(searchParams)
    const searchFilter = buildTextSearchFilter(search, USER_SEARCH_FIELDS)

    const result = await paginateQuery(
      User,
      searchFilter,
      pagination,
      { lastLoginAt: -1 }
    )

    return NextResponse.json({
      items: result.items as unknown as PublicUserProfile[],
      pagination: result.pagination,
    })
  } catch {
    return apiError('fetchUsersFailed', 500)
  }
}
