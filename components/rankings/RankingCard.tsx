import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const MEDALS = ['🥇', '🥈', '🥉']

interface RankingCardProps {
  ranking: {
    slug: string
    title: string
    excerpt: string
    useCase?: { name: string } | null
    models?: { position: number; model: { name: string; logoUrl?: string | null } }[]
  }
  className?: string
}

export function RankingCard({ ranking, className }: RankingCardProps) {
  const topThree = (ranking.models ?? [])
    .sort((a, b) => a.position - b.position)
    .slice(0, 3)

  return (
    <Link href={`/rankings/${ranking.slug}`} className="block group">
      <Card
        className={cn(
          'h-full transition-shadow hover:shadow-md hover:border-primary/40',
          className,
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {ranking.title}
            </CardTitle>
            {ranking.useCase && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                {ranking.useCase.name}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{ranking.excerpt}</p>
        </CardHeader>

        {topThree.length > 0 && (
          <CardContent className="pt-0">
            <ol className="space-y-1.5">
              {topThree.map((entry) => {
                const medal = MEDALS[entry.position - 1] ?? `${entry.position}.`
                return (
                  <li key={entry.position} className="flex items-center gap-2 text-sm">
                    <span className="text-base leading-none w-5 shrink-0">{medal}</span>
                    {entry.model.logoUrl && (
                      <Image
                        src={entry.model.logoUrl}
                        alt={entry.model.name}
                        width={16}
                        height={16}
                        className="rounded-sm object-contain"
                      />
                    )}
                    <span className="font-medium truncate">{entry.model.name}</span>
                  </li>
                )
              })}
            </ol>
          </CardContent>
        )}
      </Card>
    </Link>
  )
}
