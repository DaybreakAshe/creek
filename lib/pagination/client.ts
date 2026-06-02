import type { PaginatedResponse } from '@/lib/pagination/types'
import { DEFAULT_LIMIT } from '@/lib/pagination/types'

export interface PaginatedListQuery {
  page?: number
  limit?: number
  q?: string
  [key: string]: string | number | undefined
}

export function buildPaginatedUrl(
  basePath: string,
  query: PaginatedListQuery
): string {
  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === '') return
    params.set(key, String(value))
  })

  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

export async function fetchPaginatedList<T>(
  url: string
): Promise<PaginatedResponse<T>> {
  const response = await fetch(url)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const code = typeof data.error === 'string' ? data.error : undefined
    throw new Error(code ?? 'fetchFailed')
  }

  return data as PaginatedResponse<T>
}

export const DEFAULT_LIST_PAGE_SIZE = DEFAULT_LIMIT
