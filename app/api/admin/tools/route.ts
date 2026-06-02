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
import Tool from '@/models/tool'

const TOOL_SEARCH_FIELDS = [
  'name',
  'url',
  'description',
  'category',
  'userId',
] as const

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const pagination = parsePaginationParams(searchParams, ADMIN_PAGE_SIZE)
    const search = parseSearchQuery(searchParams)
    const searchFilter = buildTextSearchFilter(search, TOOL_SEARCH_FIELDS)

    const result = await paginateQuery(Tool, searchFilter, pagination)

    return NextResponse.json(result)
  } catch {
    return apiError('fetchToolsFailed', 500)
  }
}
