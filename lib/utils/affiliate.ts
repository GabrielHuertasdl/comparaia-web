import { createHmac } from 'crypto'

const AFFILIATE_SECRET = process.env.REVALIDATE_SECRET ?? 'fallback-secret-change-me'

export function buildAffiliateUrl(linkSlug: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://comparaia.es'
  return `${base}/api/affiliate/track/${linkSlug}`
}

export function signLink(linkId: string): string {
  return createHmac('sha256', AFFILIATE_SECRET).update(linkId).digest('hex').slice(0, 16)
}

export function validateLinkSignature(linkId: string, sig: string): boolean {
  const expected = signLink(linkId)
  return expected === sig
}
