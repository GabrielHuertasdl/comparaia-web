import type { Metadata } from 'next'
import { BASE_URL, SITE_NAME, OG_IMAGE_DEFAULTS } from '@/lib/constants/site'

function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max - 1).trimEnd() + '…'
}

function buildOpenGraph(
  title: string,
  description: string,
  url: string,
  image?: string | null,
  type: 'website' | 'article' = 'website',
): Metadata['openGraph'] {
  return {
    type,
    title,
    description,
    url,
    images: [
      {
        url: image ?? OG_IMAGE_DEFAULTS.url,
        width: OG_IMAGE_DEFAULTS.width,
        height: OG_IMAGE_DEFAULTS.height,
        alt: title,
      },
    ],
    siteName: SITE_NAME,
    locale: 'es_ES',
  }
}

function buildTwitter(title: string, description: string, image?: string | null): Metadata['twitter'] {
  return {
    card: 'summary_large_image',
    title,
    description,
    images: [image ?? OG_IMAGE_DEFAULTS.url],
  }
}

// ---------------------------------------------------------------------------
// Article
// ---------------------------------------------------------------------------
export function buildArticleMeta(article: {
  title: string
  excerpt: string
  metaTitle?: string | null
  metaDescription?: string | null
  ogImageUrl?: string | null
  slug: string
  publishedAt?: Date | null
  tags?: { tag: { name: string } }[]
}): Metadata {
  const title = article.metaTitle ?? `${article.title} | ${SITE_NAME}`
  const description = truncate(article.metaDescription ?? article.excerpt, 160)
  const url = `${BASE_URL}/noticias/${article.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph(title, description, url, article.ogImageUrl, 'article'),
    twitter: buildTwitter(title, description, article.ogImageUrl),
    ...(article.tags?.length
      ? { keywords: article.tags.map((t) => t.tag.name).join(', ') }
      : {}),
    ...(article.publishedAt
      ? { other: { 'article:published_time': article.publishedAt.toISOString() } }
      : {}),
  }
}

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------
export function buildComparisonMeta(comparison: {
  title: string
  excerpt: string
  metaTitle?: string | null
  metaDescription?: string | null
  slug: string
  models?: { model: { name: string } }[]
}): Metadata {
  const title = comparison.metaTitle ?? `${comparison.title} | ${SITE_NAME}`
  const description = truncate(comparison.metaDescription ?? comparison.excerpt, 160)
  const url = `${BASE_URL}/comparativas/${comparison.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph(title, description, url, null, 'article'),
    twitter: buildTwitter(title, description),
    ...(comparison.models?.length
      ? { keywords: comparison.models.map((m) => m.model.name).join(', ') }
      : {}),
  }
}

// ---------------------------------------------------------------------------
// Ranking
// ---------------------------------------------------------------------------
export function buildRankingMeta(
  ranking: {
    title: string
    excerpt: string
    metaTitle?: string | null
    slug: string
  },
  useCase?: { name: string } | null,
): Metadata {
  const titleBase = ranking.metaTitle ?? ranking.title
  const title = useCase
    ? `${titleBase} para ${useCase.name} | ${SITE_NAME}`
    : `${titleBase} | ${SITE_NAME}`
  const description = truncate(ranking.excerpt, 160)
  const url = `${BASE_URL}/rankings/${ranking.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph(title, description, url),
    twitter: buildTwitter(title, description),
  }
}

// ---------------------------------------------------------------------------
// Tool
// ---------------------------------------------------------------------------
export function buildToolMeta(tool: {
  name: string
  tagline: string
  slug: string
  startingPrice?: number | null
  hasFreeplan: boolean
}): Metadata {
  const pricingNote = tool.hasFreeplan
    ? 'Disponible con plan gratuito.'
    : tool.startingPrice != null
      ? `Desde ${tool.startingPrice}€/mes.`
      : ''
  const description = truncate(
    [tool.tagline, pricingNote].filter(Boolean).join(' '),
    160,
  )
  const title = `${tool.name} — Análisis y precios | ${SITE_NAME}`
  const url = `${BASE_URL}/herramientas/${tool.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph(title, description, url),
    twitter: buildTwitter(title, description),
  }
}

// ---------------------------------------------------------------------------
// Use case
// ---------------------------------------------------------------------------
export function buildUseCaseMeta(useCase: {
  name: string
  slug: string
  description: string
}): Metadata {
  const title = `Mejores IAs para ${useCase.name} | ${SITE_NAME}`
  const description = truncate(useCase.description, 160)
  const url = `${BASE_URL}/casos-de-uso/${useCase.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph(title, description, url),
    twitter: buildTwitter(title, description),
  }
}

// ---------------------------------------------------------------------------
// Default / fallback
// ---------------------------------------------------------------------------
export function buildDefaultMeta(): Metadata {
  const title = `${SITE_NAME} — Comparativas y rankings de IAs`
  const description =
    'Análisis independiente, comparativas y rankings de herramientas de inteligencia artificial. Datos verificados, metodología transparente.'

  return {
    title,
    description,
    alternates: { canonical: BASE_URL },
    openGraph: buildOpenGraph(title, description, BASE_URL),
    twitter: buildTwitter(title, description),
  }
}
