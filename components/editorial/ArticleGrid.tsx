import { cn } from '@/lib/utils/cn'
import { ArticleCard } from './ArticleCard'
import { ArticleCardSkeleton } from './ArticleCardSkeleton'

type ArticleForCard = {
  slug: string
  title: string
  excerpt: string
  publishedAt: Date | null
  contentType: string
  source?: { name: string } | null
  categories?: { category: { name: string; slug: string } }[]
}

interface ArticleGridProps {
  articles: ArticleForCard[]
  loading?: boolean
  skeletonCount?: number
  className?: string
}

export function ArticleGrid({ articles, loading, skeletonCount = 12, className }: ArticleGridProps) {
  return (
    <div className={cn('grid gap-5 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {loading
        ? Array.from({ length: skeletonCount }).map((_, i) => (
            <ArticleCardSkeleton key={i} size="md" />
          ))
        : articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
    </div>
  )
}
