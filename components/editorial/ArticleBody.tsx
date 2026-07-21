import { cn } from '@/lib/utils/cn'

interface ArticleBodyProps {
  html: string
  className?: string
}

export function ArticleBody({ html, className }: ArticleBodyProps) {
  return (
    <div
      className={cn(
        'prose prose-neutral dark:prose-invert max-w-none',
        'prose-headings:font-heading prose-headings:tracking-tight',
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        'prose-img:rounded-lg prose-img:border prose-img:border-border',
        'prose-blockquote:border-l-primary prose-blockquote:bg-muted/40 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r',
        'prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
