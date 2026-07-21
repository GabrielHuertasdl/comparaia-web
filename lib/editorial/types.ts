export * from '@/lib/types/editorial'

export interface IngestStats {
  sourceId: string
  sourceName: string
  fetched: number
  deduplicated: number
  queued: number
  rejected: number
  errors: string[]
}

export interface ClassificationResult {
  categoryIds: string[]
  tagSlugs: string[]
  mentionedModelIds: string[]
}

export interface RelevanceSignals {
  hasKnownModel: boolean
  hasBenchmarkKeyword: boolean
  isBreaking: boolean
  isRecent: boolean
  sourceAuthority: boolean
}
