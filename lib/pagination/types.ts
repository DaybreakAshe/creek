/** 分页元信息，前后端共用 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

/** 标准分页 API 响应结构 */
export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationMeta
}

/** 解析后的分页查询参数 */
export interface PaginationParams {
  page: number
  limit: number
  skip: number
}

export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 24
export const ADMIN_PAGE_SIZE = 20
export const MAX_LIMIT = 100
