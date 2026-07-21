import type { ArticleStatus, ContentType, ReviewDecision, SourceType } from '@prisma/client'

export interface RawArticle {
  title: string
  url: string
  publishedAt: Date | null
  description: string
  fullText?: string
  sourceId: string
}

export interface ProcessedArticle extends RawArticle {
  slug: string
  keyPoints: string[]
  relevanceScore: number
  suggestedCategories: string[]
  mentionedModelIds: string[]
}

export interface ArticleListItem {
  id: string
  slug: string
  title: string
  excerpt: string
  status: ArticleStatus
  contentType: ContentType
  publishedAt: Date | null
  createdAt: Date
  relevanceScore: number
  source: { name: string; url: string } | null
  categories: { name: string; slug: string }[]
}

export interface QueueItem {
  id: string
  priority: number
  addedAt: Date
  notes: string | null
  article: {
    id: string
    title: string
    excerpt: string
    sourceUrl: string | null
    relevanceScore: number
    keyPoints: string[]
    status: ArticleStatus
    contentType: ContentType
    source: { name: string } | null
  }
}

export interface ReviewPayload {
  decision: ReviewDecision
  feedback?: string
}

export interface SourceConfig {
  id: string
  name: string
  url: string
  type: SourceType
  active: boolean
  lastFetchAt: Date | null
}
