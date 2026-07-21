import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'

interface MetaItem {
  label: string
  value: string
}

interface PageHeaderProps {
  title: string
  description?: string
  badge?: string
  meta?: MetaItem[]
  className?: string
}

export default function PageHeader({ title, description, badge, meta, className }: PageHeaderProps) {
  return (
    <section className={cn('py-8 md:py-12 border-b border-border', className)}>
      <div className="container mx-auto px-4">
        {badge && (
          <Badge className="text-xs mb-3" variant="secondary">
            {badge}
          </Badge>
        )}
        <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-balance text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
        {meta && meta.length > 0 && (
          <dl className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
            {meta.map(({ label, value }) => (
              <div key={label} className="flex items-center gap-1">
                <dt>{label}</dt>
                <span aria-hidden="true">·</span>
                <dd className="text-foreground font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
}
