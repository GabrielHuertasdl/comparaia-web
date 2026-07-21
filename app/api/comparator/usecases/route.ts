import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const revalidate = 3600

export async function GET() {
  const useCases = await db.useCase.findMany({
    orderBy: { name: 'asc' },
    include: {
      criteria: {
        select: { id: true, slug: true, name: true, weight: true, description: true, unit: true, higherIsBetter: true },
        orderBy: { weight: 'desc' },
      },
    },
  })

  return NextResponse.json({ data: useCases })
}
