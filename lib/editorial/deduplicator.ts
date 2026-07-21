import { db } from '@/lib/db'

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
      }
    }
  }
  return dp[m][n]
}

export async function isDuplicateByUrl(url: string): Promise<boolean> {
  const existing = await db.article.findFirst({
    where: { sourceUrl: url },
    select: { id: true },
  })
  return existing !== null
}

export async function isDuplicateByTitle(title: string): Promise<boolean> {
  const articles = await db.article.findMany({
    where: { status: { in: ['PUBLISHED', 'APPROVED'] } },
    select: { title: true },
    orderBy: { createdAt: 'desc' },
    take: 500,
  })

  const normalizedTitle = title.toLowerCase()

  for (const article of articles) {
    const normalizedExisting = article.title.toLowerCase()
    const threshold = Math.floor(
      Math.max(normalizedTitle.length, normalizedExisting.length) * 0.1
    )
    const distance = levenshtein(normalizedTitle, normalizedExisting)
    if (distance < threshold) {
      return true
    }
  }

  return false
}

export async function isDuplicate(url: string, title: string): Promise<boolean> {
  const [byUrl, byTitle] = await Promise.all([
    isDuplicateByUrl(url),
    isDuplicateByTitle(title),
  ])
  return byUrl || byTitle
}
