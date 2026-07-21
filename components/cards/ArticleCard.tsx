import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { formatDateRelative } from '@/lib/utils/format'
import { ContentType } from '@prisma/client'

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  NEWS: 'Noticia',
  COMPARISON: 'Comparativa',
  RANKING: 'Ranking',
  GUIDE: 'Guía',
  TOOL_PROFILE: 'Herramienta',
}

type ArticleCardProps = {
  article: {
    id: string
    slug: string
    title: string
    excerpt: string
    publishedAt: Date | null
    ogImageUrl: string | null
    contentType: ContentType
    categories: { category: { slug: string; name: string } }[]
    tags: { tag: { slug: string; name: string } }[]
  }
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const primaryCategory = article.categories[0]?.category ?? null

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow group">
      {article.ogImageUrl && (
        <div className="relative h-44 w-full overflow-hidden bg-muted">
          <Image
            src={article.ogImageUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}
      <CardHeader className="pb-2 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {CONTENT_TYPE_LABELS[article.contentType]}
          </Badge>
          {primaryCategory && (
            <Badge variant="outline" className="text-xs">
              {primaryCategory.name}
            </Badge>
          )}
        </div>
        <Link
          href={`/noticias/${article.slug}`}
          className="font-heading font-semibold text-base leading-snug hover:text-primary transition-colors line-clamp-2"
        >
          {article.title}
        </Link>
      </CardHeader>
      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {article.excerpt}
        </p>
      </CardContent>
      {article.publishedAt && (
        <CardFooter className="pt-0">
          <time
            dateTime={article.publishedAt.toISOString()}
            className="text-xs text-muted-foreground"
          >
            {formatDateRelative(article.publishedAt)}
          </time>
        </CardFooter>
      )}
    </Card>
  )
}
