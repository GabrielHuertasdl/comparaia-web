import RSSParser from 'rss-parser'
import { db } from '@/lib/db'
import type { RawArticle } from '@/lib/types/editorial'
import { generateArticleSlug } from '@/lib/utils/slug'
import { scoreRelevance } from './relevance'
import { isDuplicate } from './deduplicator'
import { assignCategorySlugs, extractMentionedModelSlugs } from './classifier'
import type { IngestStats } from './types'

const BREAKING_SIGNALS = [
  'anuncia',
  'lanza',
  'nuevo',
  'breaking',
  'launches',
  'releases',
  'reveals',
]

const parser = new RSSParser({
  timeout: 10000,
})

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

  const context = description.slice(0, 300)

  return `# ${title}

**Fuente:** ${sourceUrl} | **Publicado:** ${dateStr}

## Puntos clave
${keyPointsList}

## Contexto
${context}

---
*Borrador generado automáticamente. Revisar y editar antes de publicar.*`
}

export async function fetchFromSource(source: {
  id: string
  url: string
  name: string
}): Promise<RawArticle[]> {
  try {
    const feed = await parser.parseURL(source.url)
    return (feed.items ?? []).map((item) => ({
      title: item.title ?? '(sin título)',
      url: item.link ?? '',
      publishedAt: item.pubDate ? new Date(item.pubDate) : null,
      description: item.contentSnippet ?? item.content ?? item.summary ?? '',
      sourceId: source.id,
    }))
  } catch (err) {
    console.error(`[ingestor] Error fetching ${source.url}:`, err)
    return []
  }
}

export async function ingestAllSources(): Promise<IngestStats[]> {
  const sources = await db.source.findMany({
    where: { active: true },
  })

  const allModelNames = await db.aIModel
    .findMany({ select: { name: true } })
    .then((models) => models.map((m) => m.name))

  const stats: IngestStats[] = []

  for (const source of sources) {
    const stat: IngestStats = {
      sourceId: source.id,
      sourceName: source.name,
      fetched: 0,
      deduplicated: 0,
      queued: 0,
      rejected: 0,
      errors: [],
    }

    let articles: RawArticle[] = []
    try {
      articles = await fetchFromSource(source)
      stat.fetched = articles.length
    } catch (err) {
      stat.errors.push(String(err))
      stats.push(stat)
      continue
    }

    for (const raw of articles) {
      try {
        // Skip if URL is empty
        if (!raw.url) {
          stat.rejected++
          continue
        }

        // Deduplication check
        const dup = await isDuplicate(raw.url, raw.title)
        if (dup) {
          stat.deduplicated++
          continue
        }

        // Relevance scoring
        const score = scoreRelevance(
          {
            title: raw.title,
            description: raw.description,
            publishedAt: raw.publishedAt,
            sourceUrl: raw.url,
          },
          allModelNames
        )

        if (score < 3.0) {
          stat.rejected++
          continue
        }

        // Classification
        const combinedText = `${raw.title} ${raw.description}`
        const categorySlugs = assignCategorySlugs(combinedText)
        const mentionedModelIds = await extractMentionedModelSlugs(combinedText)

        // Slug
        const slug = generateArticleSlug(raw.title, raw.publishedAt ?? undefined)

        // Key points & body
        const keyPoints = extractKeyPoints(raw.description)
        const body = buildBody(
          raw.title,
          raw.url,
          raw.publishedAt,
          keyPoints,
          raw.description
        )

        const excerpt = raw.description.slice(0, 200).trim() || raw.title

        // Breaking signal for priority bump
        const lower = combinedText.toLowerCase()
        const isBreaking = BREAKING_SIGNALS.some((sig) => lower.includes(sig))
        const priority = Math.min(10, Math.floor(score + (isBreaking ? 3 : 0)))

        // Look up category IDs by slug
        const categories =
          categorySlugs.length > 0
            ? await db.category.findMany({
                where: { slug: { in: categorySlugs } },
                select: { id: true },
              })
            : []

        // Create Article
        const article = await db.article.create({
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
            relevanceScore: score,
            keyPoints,
            ...(categories.length > 0 && {
              categories: {
                create: categories.map((c) => ({ categoryId: c.id })),
              },
            }),
            ...(mentionedModelIds.length > 0 && {
              mentionedModels: {
                create: mentionedModelIds.map((modelId) => ({ modelId })),
              },
            }),
          },
          select: { id: true },
        })

        // Create PublicationQueue entry
        await db.publicationQueue.create({
          data: {
            articleId: article.id,
            priority,
          },
        })

        stat.queued++
      } catch (err) {
        stat.errors.push(`${raw.url}: ${String(err)}`)
        stat.rejected++
      }
    }

    // Update lastFetchAt
    try {
      await db.source.update({
        where: { id: source.id },
        data: { lastFetchAt: new Date() },
      })
    } catch (err) {
      stat.errors.push(`lastFetchAt update: ${String(err)}`)
    }

    stats.push(stat)
  }

  return stats
}
