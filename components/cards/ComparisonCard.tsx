import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Cpu } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { formatDateShort } from '@/lib/utils/format'

type ComparisonCardModel = {
  displayOrder: number
  model: {
    name: string
    developer: string
    logoUrl: string | null
  }
}

type ComparisonCardProps = {
  comparison: {
    id: string
    slug: string
    title: string
    excerpt: string
    publishedAt: Date | null
    models: ComparisonCardModel[]
  }
}

export default function ComparisonCard({ comparison }: ComparisonCardProps) {
  const models = comparison.models
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, 3)

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow group">
      <CardHeader className="pb-3 gap-1">
        <Link
          href={`/comparativas/${comparison.slug}`}
          className="font-heading font-semibold text-base leading-snug hover:text-primary transition-colors line-clamp-2"
        >
          {comparison.title}
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {comparison.excerpt}
        </p>
      </CardHeader>

      {models.length > 0 && (
        <CardContent className="flex-1 pb-3">
          <div className="flex items-center gap-3 flex-wrap">
            {models.map(({ model }, i) => (
              <div key={model.name} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span className="text-muted-foreground text-xs font-mono px-0.5">vs</span>
                )}
                {model.logoUrl ? (
                  <Image
                    src={model.logoUrl}
                    alt={model.name}
                    width={20}
                    height={20}
                    className="rounded-sm object-contain"
                  />
                ) : (
                  <span className="w-5 h-5 rounded-sm bg-muted flex items-center justify-center">
                    <Cpu className="h-3 w-3 text-muted-foreground" />
                  </span>
                )}
                <span className="text-sm font-medium">{model.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      <CardFooter className="pt-0 flex items-center justify-between">
        {comparison.publishedAt && (
          <time
            dateTime={comparison.publishedAt.toISOString()}
            className="text-xs text-muted-foreground"
          >
            {formatDateShort(comparison.publishedAt)}
          </time>
        )}
        <Link
          href={`/comparativas/${comparison.slug}`}
          className="text-xs text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
          aria-label={`Ver comparativa: ${comparison.title}`}
        >
          Ver comparativa <ArrowRight className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  )
}
