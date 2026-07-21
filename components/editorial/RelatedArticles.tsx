import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { formatDateRelative } from '@/lib/utils/format'

interface RelatedArticle {
  slug: string
  title: string
  excerpt: string
  publishedAt: Date | null
}

interface RelatedArticlesProps {
  articles: RelatedArticle[]
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-heading font-semibold text-foreground">Noticias relacionadas</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {articles.map((article) => (
          <Link key={article.slug} href={`/noticias/${article.slug}`} className="block group">
            <Card className="h-full transition-shadow hover:shadow-md hover:border-primary/40">
              <CardContent className="p-4 flex flex-col gap-1.5">
                <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{article.excerpt}</p>
                {article.publishedAt && (
                  <time
                    dateTime={article.publishedAt.toISOString()}
                    className="text-xs text-muted-foreground mt-auto pt-1"
                  >
                    {formatDateRelative(article.publishedAt)}
                  </time>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
