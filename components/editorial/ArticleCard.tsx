import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { formatDateRelative } from '@/lib/utils/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const CONTENT_TYPE_LABELS: Record<string, { label: string; className: string }> = {
  NEWS: { label: 'Noticia', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  COMPARISON: { label: 'Comparativa', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  RANKING: { label: 'Ranking', className: 'bg-amber-100 text-amber-700 border-amber-200' },
}

export interface ArticleCardProps {
  article: {
    slug: string
    title: string
    excerpt: string
    publishedAt: Date | null
    contentType: string
    source?: { name: string } | null
    categories?: { category: { name: string; slug: string } }[]
  }
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ArticleCard({ article, size = 'md', className }: ArticleCardProps) {
  const typeInfo = CONTENT_TYPE_LABELS[article.contentType] ?? {
    label: article.contentType,
    className: 'bg-muted text-muted-foreground border-border',
  }

  return (
    <Card className={cn('transition-shadow duration-200 hover:shadow-md', className)}>
      <Link href={`/noticias/${article.slug}`} className="block h-full">
        <CardContent className={cn('flex flex-col gap-2', size === 'sm' ? 'p-4' : 'p-5')}>
          {/* Top row: type badge + date */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={cn('text-xs', typeInfo.className)}>{typeInfo.label}</Badge>
            {article.publishedAt && (
              <span className="text-xs text-muted-foreground">
                {formatDateRelative(article.publishedAt)}
              </span>
            )}
          </div>

          {/* Category badges */}
          {article.categories && article.categories.length > 0 && size !== 'sm' && (
            <div className="flex gap-1 flex-wrap">
              {article.categories.map(({ category }) => (
                <Badge key={category.slug} variant="outline" className="text-xs">
                  {category.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h3
            className={cn(
              'font-heading font-semibold leading-snug text-foreground group-hover:text-primary',
              size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-sm' : 'text-base',
            )}
          >
            {article.title}
          </h3>

          {/* Excerpt — hidden on sm */}
          {size !== 'sm' && (
            <p
              className={cn(
                'text-muted-foreground leading-relaxed line-clamp-2',
                size === 'lg' ? 'text-base' : 'text-sm',
              )}
            >
              {article.excerpt}
            </p>
          )}

          {/* Source */}
          {article.source && size !== 'sm' && (
            <p className="text-xs text-muted-foreground mt-auto pt-1">{article.source.name}</p>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}
