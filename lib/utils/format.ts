import { format, formatDistanceToNow, isAfter, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, "d 'de' MMMM 'de' yyyy", { locale: es })
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy')
}

export function formatDateRelative(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isAfter(d, subDays(new Date(), 7))) {
    return formatDistanceToNow(d, { addSuffix: true, locale: es })
  }
  return formatDate(d)
}

export function formatScore(score: number): string {
  return score.toFixed(1)
}

export function formatScorePercent(score: number): string {
  return `${Math.round(score)}%`
}

export function formatPrice(price: number | null | undefined, currency = 'EUR'): string {
  if (price === null || price === undefined) return 'Gratis'
  if (price === 0) return 'Gratis'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('es-ES').format(n)
}

export function readingTime(text: string): number {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}
