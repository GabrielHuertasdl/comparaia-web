import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { revalidatePath } from 'next/cache'

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET ?? 'change-me'

function verifySignature(body: string, signature: string): boolean {
  const expected = createHmac('sha256', REVALIDATE_SECRET).update(body).digest('hex')
  return expected === signature
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-signature') ?? ''
  const bodyText = await request.text()

  if (!verifySignature(bodyText, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let body: { type: string; slug: string }
  try {
    body = JSON.parse(bodyText)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const pathMap: Record<string, string> = {
    article: `/noticias/${body.slug}`,
    comparison: `/comparativas/${body.slug}`,
    ranking: `/rankings/${body.slug}`,
    tool: `/herramientas/${body.slug}`,
    guide: `/guias/${body.slug}`,
  }

  const path = pathMap[body.type]
  if (!path) {
    return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
  }

  revalidatePath(path)

  return NextResponse.json({ revalidated: true, path })
}
