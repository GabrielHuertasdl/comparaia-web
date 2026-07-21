import { BASE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants/site'

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------
export function buildOrganizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    description: SITE_DESCRIPTION,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/logo.svg`,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hola@comparaia.es',
      contactType: 'customer support',
      availableLanguage: 'Spanish',
    },
    sameAs: [],
  }
}

// ---------------------------------------------------------------------------
// WebSite (with SearchAction)
// ---------------------------------------------------------------------------
export function buildWebSiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'es',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/buscar?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// ---------------------------------------------------------------------------
// Article (NewsArticle)
// ---------------------------------------------------------------------------
export function buildArticleSchema(article: {
  title: string
  excerpt: string
  publishedAt?: Date | null
  slug: string
  author?: { name: string } | null
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    url: `${BASE_URL}/noticias/${article.slug}`,
    ...(article.publishedAt
      ? {
          datePublished: article.publishedAt.toISOString(),
          dateModified: article.publishedAt.toISOString(),
        }
      : {}),
    author: article.author
      ? {
          '@type': 'Person',
          name: article.author.name,
        }
      : {
          '@type': 'Organization',
          name: SITE_NAME,
          url: BASE_URL,
        },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/noticias/${article.slug}`,
    },
  }
}

// ---------------------------------------------------------------------------
// ItemList
// ---------------------------------------------------------------------------
export function buildItemListSchema(
  items: { name: string; url: string; position: number }[],
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  }
}

// ---------------------------------------------------------------------------
// SoftwareApplication
// ---------------------------------------------------------------------------
export function buildSoftwareAppSchema(tool: {
  name: string
  description: string
  websiteUrl?: string | null
  startingPrice?: number | null
  hasFreeplan: boolean
}): object {
  const offers: object[] = []

  if (tool.hasFreeplan) {
    offers.push({
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      name: 'Plan gratuito',
    })
  }

  if (tool.startingPrice != null) {
    offers.push({
      '@type': 'Offer',
      price: tool.startingPrice.toString(),
      priceCurrency: 'EUR',
      name: 'Plan de pago',
    })
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    applicationCategory: 'Artificial Intelligence',
    operatingSystem: 'Web',
    ...(tool.websiteUrl ? { url: tool.websiteUrl } : {}),
    ...(offers.length > 0
      ? { offers: offers.length === 1 ? offers[0] : offers }
      : {}),
  }
}

// ---------------------------------------------------------------------------
// BreadcrumbList
// ---------------------------------------------------------------------------
export function buildBreadcrumbSchema(
  items: { name: string; url: string }[],
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// ---------------------------------------------------------------------------
// FAQPage
// ---------------------------------------------------------------------------
export function buildFAQSchema(
  items: { question: string; answer: string }[],
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
