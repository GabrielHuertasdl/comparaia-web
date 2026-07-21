import { cn } from '@/lib/utils/cn'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ArticleCardSkeletonProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ArticleCardSkeleton({ size = 'md', className }: ArticleCardSkeletonProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className={cn('flex flex-col gap-2', size === 'sm' ? 'p-4' : 'p-5')}>
        {/* Type badge + date row */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Category badges row — only md/lg */}
        {size !== 'sm' && (
          <div className="flex gap-1">
            <Skeleton className="h-4 w-14 rounded-full" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
        )}

        {/* Title */}
        <Skeleton className={cn('w-full rounded', size === 'lg' ? 'h-7' : 'h-5')} />
        {size !== 'sm' && <Skeleton className="w-4/5 rounded h-5" />}

        {/* Excerpt lines — only md/lg */}
        {size !== 'sm' && (
          <div className="flex flex-col gap-1.5 pt-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}

        {/* Source — only md/lg */}
        {size !== 'sm' && <Skeleton className="h-3 w-24 mt-auto" />}
      </CardContent>
    </Card>
  )
}
