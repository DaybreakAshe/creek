import type { FilterQuery, Model } from 'mongoose'
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
  type PaginatedResponse,
  type PaginationMeta,
  type PaginationParams,
} from '@/lib/pagination/types'

export function parsePaginationParams(
  searchParams: URLSearchParams,
  defaultLimit = DEFAULT_LIMIT
): PaginationParams {
  const page = Math.max(Number(searchParams.get('page')) || DEFAULT_PAGE, 1)
  const limit = Math.min(
    Math.max(Number(searchParams.get('limit')) || defaultLimit, 1),
    MAX_LIMIT
  )

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  }
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit)

  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  }
}

export function parseSearchQuery(searchParams: URLSearchParams): string {
  return (searchParams.get('q') ?? searchParams.get('search') ?? '').trim()
}

/** 转义正则特殊字符，用于 MongoDB $regex 搜索 */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function buildTextSearchFilter(
  query: string,
  fields: readonly string[]
): FilterQuery<Record<string, unknown>> {
  if (!query) return {}

  const regex = new RegExp(escapeRegex(query), 'i')

  return {
    $or: fields.map((field) => ({ [field]: regex })),
  }
}

export async function paginateQuery<T>(
  model: Model<T>,
  filter: FilterQuery<T>,
  params: PaginationParams,
  sort: Record<string, 1 | -1> = { createdAt: -1 }
): Promise<PaginatedResponse<T>> {
  const [total, items] = await Promise.all([
    model.countDocuments(filter),
    model
      .find(filter)
      .sort(sort)
      .skip(params.skip)
      .limit(params.limit)
      .lean<T[]>(),
  ])

  return {
    items,
    pagination: buildPaginationMeta(params.page, params.limit, total),
  }
}
