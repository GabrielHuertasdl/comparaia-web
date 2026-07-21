const BENCHMARK_KEYWORDS = [
  'benchmark',
  'score',
  'eval',
  'mmlu',
  'humaneval',
  'ranking',
  'mejor',
  'superado',
  'record',
]

const BREAKING_SIGNALS = [
  'anuncia',
  'lanza',
  'nuevo',
  'breaking',
  'launches',
  'releases',
  'reveals',
]

const AUTHORITATIVE_DOMAINS = [
  'techcrunch.com',
  'venturebeat.com',
  'theverge.com',
  'wired.com',
  'xataka.com',
  'elpais.com',
]

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function scoreRelevance(
  article: {
    title: string
    description: string
    publishedAt: Date | null
    sourceUrl?: string
  },
  knownModelNames: string[]
): number {
  const combined = `${article.title} ${article.description}`.toLowerCase()
  let score = 0

  // +2.0 if mentions ≥1 known model
  if (knownModelNames.some((name) => combined.includes(name.toLowerCase()))) {
    score += 2.0
  }

  // +3.0 if contains benchmark keywords
  if (BENCHMARK_KEYWORDS.some((kw) => combined.includes(kw))) {
    score += 3.0
  }

  // +2.0 if breaking signal
  if (BREAKING_SIGNALS.some((sig) => combined.includes(sig))) {
    score += 2.0
  }

  // +1.5 if source is authoritative
  if (
    article.sourceUrl &&
    AUTHORITATIVE_DOMAINS.some((domain) => article.sourceUrl!.includes(domain))
  ) {
    score += 1.5
  }

  // +1.5 if publishedAt within last 24 hours
  if (
    article.publishedAt !== null &&
    Date.now() - article.publishedAt.getTime() < MS_PER_DAY
  ) {
    score += 1.5
  }

  return Math.min(10.0, score)
}
