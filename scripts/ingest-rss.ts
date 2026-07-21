/**
 * ingest-rss.ts — Standalone RSS ingestion script
 *
 * Usage:
 *   npm run ingest
 *   tsx scripts/ingest-rss.ts
 *
 * Runs outside the Next.js runtime, so it instantiates its own PrismaClient
 * and does not import from @/ aliases. All logic is self-contained.
 */

import { PrismaClient } from '@prisma/client'
import Parser from 'rss-parser'
import { slugify } from '../lib/utils/slug'

// ── Types ─────────────────────────────────────────────────────────────────────

interface RawArticle {
  title: string
  url: string
  publishedAt: Date | null
  description: string
  sourceId: string
  sourceName: string
}

interface IngestResult {
  sourceId: string
  sourceName: string
  fetched: number
  deduplicated: number
  queued: number
  rejected: number
  errors: string[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const RELEVANCE_THRESHOLD = 3.0

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

// ── Slug ──────────────────────────────────────────────────────────────────────

function generateSlug(title: string, date?: Date): string {
  const d = date ?? new Date()
  const datePart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  const titleSlug = slugify(title)
  return `${datePart}-${titleSlug}`.slice(0, 100)
}

// ── Relevance scoring ─────────────────────────────────────────────────────────

function scoreRelevance(
  article: { title: string; description: string; publishedAt: Date | null; url: string },
  knownModelNames: string[]
): number {
  const combined = `${article.title} ${article.description}`.toLowerCase()
  let score = 0

  if (knownModelNames.some((name) => combined.includes(name.toLowerCase()))) {
    score += 2.0
  }

  if (BENCHMARK_KEYWORDS.some((kw) => combined.includes(kw))) {
    score += 3.0
  }

  if (BREAKING_SIGNALS.some((sig) => combined.includes(sig))) {
    score += 2.0
  }

  if (AUTHORITATIVE_DOMAINS.some((domain) => article.url.includes(domain))) {
    score += 1.5
  }

  if (article.publishedAt !== null && Date.now() - article.publishedAt.getTime() < MS_PER_DAY) {
    score += 1.5
  }

  return Math.min(10.0, score)
}

// ── Body builder ──────────────────────────────────────────────────────────────

function extractKeyPoints(description: string): string[] {
  return description
    .split(/[.!?]\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20)
    .slice(0, 5)
}

function buildBody(
  title: string,
  sourceUrl: string,
  publishedAt: Date | null,
  keyPoints: string[],
  description: string
): string {
  const dateStr = publishedAt
    ? publishedAt.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Fecha desconocida'

  const keyPointsList =
    keyPoints.length > 0
      ? keyPoints.map((p) => `- ${p}`).join('\n')
      : '- (pendiente de revisión)'

  return `# ${title}

**Fuente:** ${sourceUrl} | **Publicado:** ${dateStr}

## Puntos clave
${keyPointsList}

## Contexto
${description.slice(0, 300)}

---
*Borrador generado automáticamente. Revisar y editar antes de publicar.*`
}

// ── Category classification (keyword-based) ───────────────────────────────────

const CATEGORY_SIGNALS: Record<string, string[]> = {
  modelos: ['gpt', 'claude', 'gemini', 'llama', 'mistral', 'modelo', 'model', 'lm', 'llm'],
  herramientas: ['tool', 'herramienta', 'app', 'api', 'sdk', 'plugin', 'extension'],
  investigacion: ['paper', 'research', 'study', 'investigacion', 'arxiv', 'academic'],
  empresas: ['openai', 'anthropic', 'google', 'meta', 'microsoft', 'startup', 'funding'],
  regulacion: ['regulation', 'regulacion', 'ley', 'eu ai act', 'compliance', 'policy'],
}

function classifyCategories(text: string): string[] {
  const lower = text.toLowerCase()
  return Object.entries(CATEGORY_SIGNALS)
    .filter(([, keywords]) => keywords.some((kw) => lower.includes(kw)))
    .map(([slug]) => slug)
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const prisma = new PrismaClient()
  const parser = new Parser({ timeout: 10_000 })

  try {
    console.log('[ingest] Starting RSS ingestion...')

    // Fetch active sources
    const sources = await prisma.source.findMany({ where: { active: true } })
    if (sources.length === 0) {
      console.log('[ingest] No active sources found. Add sources via Prisma Studio or seed script.')
      return
    }

    // Fetch all known model names for relevance scoring
    const knownModelNames = await prisma.aIModel
      .findMany({ select: { name: true } })
      .then((models) => models.map((m) => m.name))

    const results: IngestResult[] = []
    let totalQueued = 0
    let totalRejected = 0

    for (const source of sources) {
      const result: IngestResult = {
        sourceId: source.id,
        sourceName: source.name,
        fetched: 0,
        deduplicated: 0,
        queued: 0,
        rejected: 0,
        errors: [],
      }

      // Fetch RSS feed
      let rawArticles: RawArticle[] = []
      try {
        const feed = await parser.parseURL(source.url)
        rawArticles = (feed.items ?? []).map((item) => ({
          title: item.title ?? '(sin título)',
          url: item.link ?? '',
          publishedAt: item.pubDate ? new Date(item.pubDate) : null,
          description: item.contentSnippet ?? item.content ?? item.summary ?? '',
          sourceId: source.id,
          sourceName: source.name,
        }))
        result.fetched = rawArticles.length
      } catch (err) {
        result.errors.push(`fetch error: ${String(err)}`)
        results.push(result)
        console.error(`[ingest] Failed to fetch ${source.name} (${source.url}):`, err)
        continue
      }

      // Process each article
      for (const raw of rawArticles) {
        // Skip empty URLs
        if (!raw.url) {
          result.rejected++
          continue
        }

        try {
          // Deduplication: check sourceUrl uniqueness
          const existing = await prisma.article.findFirst({
            where: { sourceUrl: raw.url },
            select: { id: true },
          })
          if (existing) {
            result.deduplicated++
            continue
          }

          // Relevance scoring
          const relevance = scoreRelevance(
            { title: raw.title, description: raw.description, publishedAt: raw.publishedAt, url: raw.url },
            knownModelNames
          )

          if (relevance < RELEVANCE_THRESHOLD) {
            result.rejected++
            continue
          }

          // Category classification
          const combinedText = `${raw.title} ${raw.description}`
          const categorySlugs = classifyCategories(combinedText)

          // Resolve category IDs
          const categories =
            categorySlugs.length > 0
              ? await prisma.category.findMany({
                  where: { slug: { in: categorySlugs } },
                  select: { id: true },
                })
              : []

          // Resolve mentioned model IDs
          const mentionedModels = await prisma.aIModel.findMany({
            where: {
              name: {
                in: knownModelNames.filter((name) =>
                  combinedText.toLowerCase().includes(name.toLowerCase())
                ),
              },
            },
            select: { id: true },
          })

          // Build content
          const slug = generateSlug(raw.title, raw.publishedAt ?? undefined)
          const keyPoints = extractKeyPoints(raw.description)
          const body = buildBody(raw.title, raw.url, raw.publishedAt, keyPoints, raw.description)
          const excerpt = raw.description.slice(0, 200).trim() || raw.title

          // Priority: base relevance + breaking bump, capped at 10
          const lower = combinedText.toLowerCase()
          const isBreaking = BREAKING_SIGNALS.some((sig) => lower.includes(sig))
          const priority = Math.min(10, Math.floor(relevance + (isBreaking ? 3 : 0)))

          // Create Article record
          const article = await prisma.article.create({
            data: {
              slug,
              title: raw.title,
              excerpt,
              body,
              status: 'INGESTED',
              contentType: 'NEWS',
              sourceId: source.id,
              sourceUrl: raw.url,
              sourcePublishedAt: raw.publishedAt,
              relevanceScore: relevance,
              keyPoints,
              ...(categories.length > 0 && {
                categories: {
                  create: categories.map((c) => ({ categoryId: c.id })),
                },
              }),
              ...(mentionedModels.length > 0 && {
                mentionedModels: {
                  create: mentionedModels.map((m) => ({ modelId: m.id })),
                },
              }),
            },
            select: { id: true },
          })

          // Create PublicationQueue entry
          await prisma.publicationQueue.create({
            data: { articleId: article.id, priority },
          })

          result.queued++
        } catch (err) {
          result.errors.push(`${raw.url}: ${String(err)}`)
          result.rejected++
        }
      }

      // Update source.lastFetchAt
      try {
        await prisma.source.update({
          where: { id: source.id },
          data: { lastFetchAt: new Date() },
        })
      } catch (err) {
        result.errors.push(`lastFetchAt update: ${String(err)}`)
      }

      totalQueued += result.queued
      totalRejected += result.rejected
      results.push(result)

      console.log(
        `[ingest] ${source.name}: fetched=${result.fetched} deduped=${result.deduplicated} queued=${result.queued} rejected=${result.rejected}${result.errors.length > 0 ? ` errors=${result.errors.length}` : ''}`
      )
    }

    // Summary
    console.log(
      `[ingest] Done. Ingested from ${sources.length} sources — ${totalQueued} queued, ${totalRejected} rejected.`
    )

    // Surface errors if any
    const allErrors = results.flatMap((r) => r.errors.map((e) => `[${r.sourceName}] ${e}`))
    if (allErrors.length > 0) {
      console.warn('[ingest] Errors encountered:')
      allErrors.forEach((e) => console.warn(' ', e))
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('[ingest] Fatal error:', err)
  process.exit(1)
})
