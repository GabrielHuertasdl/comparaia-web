import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { ingestAllSources } from '@/lib/editorial/ingestor'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await ingestAllSources()
    const totalQueued = results.reduce((sum, r) => sum + r.queued, 0)
    const totalFetched = results.reduce((sum, r) => sum + r.fetched, 0)

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: 'UPDATE',
        entityType: 'Ingest',
        entityId: 'manual',
        after: { totalFetched, totalQueued, sources: results.length },
      },
    })

    return NextResponse.json({ data: { results, totalQueued, totalFetched } })
  } catch (error) {
    console.error('[Ingest] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ingest failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
