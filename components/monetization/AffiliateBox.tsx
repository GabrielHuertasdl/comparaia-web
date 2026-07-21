import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AffiliateDisclosure } from './AffiliateDisclosure'

interface AffiliateModel {
  name: string
  logoUrl?: string | null
  affiliateLinks: {
    slug: string
    destination: string
    partner: string
    active: boolean
  }[]
}

interface AffiliateBoxProps {
  models: AffiliateModel[]
}

export function AffiliateBox({ models }: AffiliateBoxProps) {
  const withLinks = models.filter((m) => m.affiliateLinks.some((l) => l.active))
  if (withLinks.length === 0) return null

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Prueba estas IAs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {withLinks.map((model) => {
          const link = model.affiliateLinks.find((l) => l.active)
          if (!link) return null
          return (
            <div key={model.name} className="flex items-center gap-3">
              {model.logoUrl && (
                <Image
                  src={model.logoUrl}
                  alt={model.name}
                  width={28}
                  height={28}
                  className="rounded object-contain shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{model.name}</p>
                <AffiliateDisclosure compact />
              </div>
              <Button asChild size="sm" variant="outline" className="shrink-0 h-8 text-xs gap-1">
                <Link href={`/r/${link.slug}`} target="_blank" rel="noopener noreferrer sponsored">
                  Probar
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
