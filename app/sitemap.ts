import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { BASE_URL } from '@/lib/constants/site'
import { ArticleStatus } from '@prisma/client'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const [articles, comparisons, rankings, tools, useCases] = await Promise.all([
    db.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      select: { slug: true, publishedAt: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    }),
    db.comparison.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true, publishedAt: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    }),
    db.ranking.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true, publishedAt: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    }),
    db.aITool.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    }),
    db.useCase.findMany({
      select: { slug: true },
    }),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/rankings`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/comparativas`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/herramientas`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/comparador`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/noticias`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/mejor-ia-para`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/guias`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/sobre`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/metodologia`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.65,
    },
    {
      url: `${BASE_URL}/contacto`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/newsletter`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.55,
    },
  ]

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/noticias/${a.slug}`,
    lastModified: a.updatedAt ?? a.publishedAt ?? now,
    changeFrequency: 'weekly',
    priority: 0.65,
  }))

  const comparisonPages: MetadataRoute.Sitemap = comparisons.map((c) => ({
    url: `${BASE_URL}/comparativas/${c.slug}`,
    lastModified: c.updatedAt ?? c.publishedAt ?? now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const rankingPages: MetadataRoute.Sitemap = rankings.map((r) => ({
    url: `${BASE_URL}/rankings/${r.slug}`,
    lastModified: r.updatedAt ?? r.publishedAt ?? now,
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  const toolPages: MetadataRoute.Sitemap = tools.map((t) => ({
    url: `${BASE_URL}/herramientas/${t.slug}`,
    lastModified: t.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.75,
  }))

  const useCasePages: MetadataRoute.Sitemap = useCases.map((u) => ({
    url: `${BASE_URL}/mejor-ia-para/${u.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    ...staticPages,
    ...rankingPages,
    ...comparisonPages,
    ...useCasePages,
    ...toolPages,
    ...articlePages,
  ]
}
