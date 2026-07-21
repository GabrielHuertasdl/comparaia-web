import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request, { params }: { params: { linkId: string } }) {
  const link = await db.affiliateLink.findUnique({
    where: { slug: params.linkId },
    select: { id: true, destination: true, active: true },
  })

  if (!link || !link.active) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 })
  }

  // Fire-and-forget click tracking — do not await
  db.affiliateLink
    .update({
      where: { id: link.id },
      data: { clickCount: { increment: 1 } },
    })
    .catch(() => {})

  return NextResponse.redirect(link.destination, { status: 302 })
}
