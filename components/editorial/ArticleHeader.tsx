import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/utils/format'

interface ArticleHeaderProps {
  article: {
    title: string
    excerpt: string
    publishedAt: Date | null
    author?: { name: string } | null
    categories?: { category: { name: string; slug: string } }[]
    tags?: { tag: { name: string; slug: string } }[]
  }
}

export function ArticleHeader({ article }: ArticleHeaderProps) {
  return (
    <header className="space-y-4">
      {/* Categories */}
      {article.categories && article.categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.categories.map(({ category }) => (
            <Link key={category.slug} href={`/noticias/categoria/${category.slug}`}>
              <Badge variant="secondary">{category.name}</Badge>
            </Link>
          ))}
        </div>
      )}

      <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight leading-tight text-foreground">
        {article.title}
      </h1>

      <p className="text-lg text-muted-foreground leading-relaxed">{article.excerpt}</p>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {article.author && (
          <span>
            Por <span className="font-medium text-foreground">{article.author.name}</span>
          </span>
        )}
        {article.publishedAt && (
          <>
            {article.author && <span aria-hidden="true">·</span>}
            <time dateTime={article.publishedAt.toISOString()}>
              {formatDate(article.publishedAt)}
            </time>
          </>
        )}
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {article.tags.map(({ tag }) => (
            <Badge key={tag.slug} variant="outline" className="text-xs">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      <Separator />
    </header>
  )
}
