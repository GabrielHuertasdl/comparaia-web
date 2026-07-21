import type { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/constants/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/newsletter/confirm'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
