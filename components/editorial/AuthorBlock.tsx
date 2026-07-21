import { User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { SITE_NAME } from '@/lib/constants/site'

interface AuthorBlockProps {
  author: { name: string } | null
  className?: string
}

export function AuthorBlock({ author, className }: AuthorBlockProps) {
  const displayName = author?.name ?? `Redacción ${SITE_NAME}`

  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <span className="inline-flex items-center justify-center size-7 rounded-full bg-muted">
        <User className="size-4" />
      </span>
      <span>{displayName}</span>
    </div>
  )
}
