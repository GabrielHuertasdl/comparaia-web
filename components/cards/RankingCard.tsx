import Link from 'next/link'
import Image from 'next/image'
import { Trophy, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { formatDateShort } from '@/lib/utils/format'

type RankingCardModel = {
  position: number
  totalScore: number
  model: {
    name: string
    developer: string
    logoUrl: string | null
  }
}

type RankingCardProps = {
  ranking: {
    id: string
    slug: string
    title: string
    excerpt: string
    publishedAt: Date | null
    useCase: { name: string; iconName: string | null; slug: string } | null
    models: RankingCardModel[]
  }
}

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function RankingCard({ ranking }: RankingCardProps) {
  const top3 = ranking.models
    .slice()
    .sort((a, b) => a.position - b.position)
    .slice(0, 3)

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow group">
      <CardHeader className="pb-3 gap-1">
        {ranking.useCase && (
          <Badge variant="secondary" className="text-xs w-fit">
            {ranking.useCase.name}
          </Badge>
        )}
        <Link
          href={`/rankings/${ranking.slug}`}
          className="font-heading font-semibold text-base leading-snug hover:text-primary transition-colors line-clamp-2 group-hover:text-primary"
        >
          {ranking.title}
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {ranking.excerpt}
        </p>
      </CardHeader>

      {top3.length > 0 && (
        <CardContent className="flex-1 pb-3">
          <ol className="flex flex-col gap-2">
            {top3.map(({ position, totalScore, model }) => (
              <li key={position} className="flex items-center gap-2">
                <span className="text-base leading-none w-6 text-center" aria-label={`Posición ${position}`}>
                  {MEDAL[position] ?? (
                    <span className="text-xs font-mono text-muted-foreground">#{position}</span>
                  )}
                </span>
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
                    <Trophy className="h-3 w-3 text-muted-foreground" />
                  </span>
                )}
                <span className="text-sm font-medium flex-1 truncate">{model.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {totalScore.toFixed(1)}
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      )}

      <CardFooter className="pt-0 flex items-center justify-between">
        {ranking.publishedAt && (
          <time
            dateTime={ranking.publishedAt.toISOString()}
            className="text-xs text-muted-foreground"
          >
            {formatDateShort(ranking.publishedAt)}
          </time>
        )}
        <Link
          href={`/rankings/${ranking.slug}`}
          className="text-xs text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
          aria-label={`Ver ranking completo: ${ranking.title}`}
        >
          Ver ranking <ArrowRight className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  )
}
