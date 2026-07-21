export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateArticleSlug(title: string, date?: Date): string {
  const d = date ?? new Date()
  const datePart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  return `${datePart}-${slugify(title)}`.slice(0, 100)
}
