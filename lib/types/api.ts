export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface NewsletterSubscribeRequest {
  email: string
  consent: boolean
  segment?: string
}

export interface ComparatorScoreRequest {
  modelIds: string[]
  useCaseId: string
  weights?: Record<string, number>
}

export interface IngestResult {
  fetched: number
  deduplicated: number
  queued: number
  rejected: number
  errors: string[]
}
