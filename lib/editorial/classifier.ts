import { db } from '@/lib/db'

const CATEGORY_KEYWORDS: Map<string, string[]> = new Map([
  ['openai', ['openai', 'chatgpt', 'gpt-4', 'gpt-3', 'dall-e', 'sora', 'o1', 'o3']],
  ['anthropic', ['anthropic', 'claude', 'claude-3', 'claude-4']],
  ['google', ['google', 'gemini', 'bard', 'deepmind', 'gemma']],
  ['meta', ['meta', 'llama', 'llama-3']],
  ['mistral', ['mistral', 'mixtral', 'mistral-large']],
  ['modelos', ['modelo', 'llm', 'benchmark', 'evaluacion', 'lmarena']],
  ['herramientas', ['copilot', 'cursor', 'perplexity', 'midjourney', 'stable diffusion']],
])

const STOPWORDS = new Set([
  'sobre',
  'desde',
  'hasta',
  'entre',
  'para',
  'with',
  'that',
  'this',
  'from',
  'have',
  'will',
])

export function assignCategorySlugs(text: string): string[] {
  const lower = text.toLowerCase()
  const matched: string[] = []
  for (const [slug, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      matched.push(slug)
    }
  }
  return matched
}

export async function extractMentionedModelSlugs(text: string): Promise<string[]> {
  const models = await db.aIModel.findMany({
    select: { id: true, name: true },
  })

  const lower = text.toLowerCase()
  const mentioned: string[] = []

  for (const model of models) {
    if (lower.includes(model.name.toLowerCase())) {
      mentioned.push(model.id)
    }
  }

  return mentioned
}

export function generateTagSlugs(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-záéíóúüña-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 5 && !STOPWORDS.has(w))

  const freq = new Map<string, number>()
  for (const word of words) {
    freq.set(word, (freq.get(word) ?? 0) + 1)
  }

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)
}
