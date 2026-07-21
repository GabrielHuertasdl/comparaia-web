import { Badge } from '@/components/ui/badge'
import { AffiliateBox } from './AffiliateBox'
import { cn } from '@/lib/utils/cn'

interface RecommendedTool {
  slug: string
  name: string
  tagline: string
  logoUrl?: string | null
  hasFreeplan: boolean
  affiliateLink?: { slug: string } | null
}

interface RecommendedToolsProps {
  tools: RecommendedTool[]
  sponsored?: boolean
  title?: string
}

function PlainToolCard({ tool }: { tool: RecommendedTool }) {
  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-sm text-[hsl(var(--card-foreground))]">
          {tool.name}
        </span>
        {tool.hasFreeplan && (
          <Badge variant="secondary" className="text-xs">
            Plan gratuito
          </Badge>
        )}
      </div>
      <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">{tool.tagline}</p>
    </div>
  )
}

export function RecommendedTools({
  tools,
  sponsored = false,
  title = 'Herramientas destacadas',
}: RecommendedToolsProps) {
  const displayed = tools.slice(0, 3)

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-sm text-[hsl(var(--foreground))]">{title}</h3>
        {sponsored && (
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] uppercase tracking-wide border-[hsl(var(--affiliate))] text-[hsl(var(--affiliate))]',
            )}
          >
            Patrocinado
          </Badge>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {displayed.map((tool) =>
          tool.affiliateLink ? (
            <AffiliateBox
              key={tool.slug}
              models={[
                {
                  name: tool.name,
                  logoUrl: tool.logoUrl,
                  affiliateLinks: [
                    {
                      slug: tool.affiliateLink.slug,
                      destination: `/api/affiliate/track/${tool.affiliateLink.slug}`,
                      partner: tool.slug,
                      active: true,
                    },
                  ],
                },
              ]}
            />
          ) : (
            <PlainToolCard key={tool.slug} tool={tool} />
          ),
        )}
      </div>
    </section>
  )
}
