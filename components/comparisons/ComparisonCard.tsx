import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

interface ComparisonCardProps {
  comparison: {
    slug: string
    title: string
    excerpt: string
    models?: { model: { name: string; logoUrl?: string | null } }[]
  }
  className?: string
}

export function ComparisonCard({ comparison, className }: ComparisonCardProps) {
  return (
    <Link href={`/comparativas/${comparison.slug}`} className="block group">
      <Card className={cn('h-full transition-shadow hover:shadow-md hover:border-primary/40', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {comparison.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{comparison.excerpt}</p>
        </CardHeader>

        {comparison.models && comparison.models.length > 0 && (
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {comparison.models.map(({ model }) => (
                <div key={model.name} className="flex items-center gap-1.5">
                  {model.logoUrl && (
                    <Image
                      src={model.logoUrl}
                      alt={model.name}
                      width={16}
                      height={16}
                      className="rounded-sm object-contain"
                    />
                  )}
                  <Badge variant="outline" className="text-xs">
                    {model.name}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  )
}
