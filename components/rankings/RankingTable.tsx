import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatScore } from '@/lib/utils/format'

const MEDALS = ['🥇', '🥈', '🥉']

interface RankingEntry {
  position: number
  totalScore: number
  model: {
    slug: string
    name: string
    developer: string
    logoUrl?: string | null
    scores?: {
      criteriaId: string
      criteria: { name: string }
      normalizedScore?: number | null
    }[]
  }
}

interface RankingTableProps {
  entries: RankingEntry[]
}

export function RankingTable({ entries }: RankingTableProps) {
  if (entries.length === 0) return null

  const sorted = [...entries].sort((a, b) => a.position - b.position)

  // Gather all criteria
  const criteriaMap = new Map<string, string>()
  for (const entry of sorted) {
    for (const score of entry.model.scores ?? []) {
      criteriaMap.set(score.criteriaId, score.criteria.name)
    }
  }
  const criteriaList = Array.from(criteriaMap.entries())

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="py-3 px-4 text-left w-12 font-medium text-muted-foreground">#</th>
            <th className="py-3 px-4 text-left font-medium text-muted-foreground">Modelo</th>
            <th className="py-3 px-4 text-center font-medium text-muted-foreground">Puntuación</th>
            {criteriaList.map(([id, name]) => (
              <th key={id} className="py-3 px-4 text-center font-medium text-muted-foreground">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((entry) => {
            const medal = MEDALS[entry.position - 1]
            return (
              <tr
                key={entry.model.slug}
                className="border-b border-border last:border-0 hover:bg-muted/20"
              >
                <td className="py-3 px-4">
                  <span className="text-base leading-none">{medal ?? entry.position}</span>
                </td>
                <td className="py-3 px-4">
                  <Link
                    href={`/herramientas/${entry.model.slug}`}
                    className="flex items-center gap-2.5 group"
                  >
                    {entry.model.logoUrl && (
                      <Image
                        src={entry.model.logoUrl}
                        alt={entry.model.name}
                        width={24}
                        height={24}
                        className="rounded object-contain shrink-0"
                      />
                    )}
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {entry.model.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{entry.model.developer}</p>
                    </div>
                  </Link>
                </td>
                <td className="py-3 px-4 text-center">
                  <Badge variant="secondary" className="font-mono font-semibold">
                    {formatScore(entry.totalScore)}
                  </Badge>
                </td>
                {criteriaList.map(([id]) => {
                  const score = entry.model.scores?.find((s) => s.criteriaId === id)
                  return (
                    <td key={id} className="py-3 px-4 text-center text-muted-foreground">
                      {score?.normalizedScore != null ? formatScore(score.normalizedScore) : '—'}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
