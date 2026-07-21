# ComparaIA

Comparamos las IAs para que tú elijas mejor.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL
- Vercel (deployment)

## Quick Start

```bash
# 1. Clone and install
cd comparaia
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and JWT_SECRET

# 3. Set up database
npx prisma migrate dev --name init
npm run db:seed

# 4. Start development server
npm run dev
```

## Project Structure

```
comparaia/
├── app/                    # Next.js App Router pages and API routes
├── components/
│   ├── cards/              # ArticleCard, ComparisonCard, RankingCard
│   ├── layout/             # Navigation, Footer, Breadcrumb, PageHeader
│   ├── monetization/       # AdSlot, AffiliateBox, NewsletterSignup
│   └── ui/                 # shadcn/ui primitives
├── content/
│   ├── legal/              # Legal document drafts (aviso legal, privacidad, cookies)
│   └── templates/          # Editorial templates for editors
│       ├── article-draft.md    # Template for news articles
│       └── comparison-draft.md # Template for comparison articles
├── lib/
│   ├── auth.ts             # JWT authentication helpers
│   ├── db.ts               # Prisma singleton (Next.js runtime)
│   ├── constants/          # Site config, use cases
│   ├── editorial/          # Ingestor, classifier, deduplicator, relevance scorer
│   ├── hooks/              # React hooks (comparator, cookie consent)
│   ├── scoring/            # Score engine, normalizer, types
│   ├── seo/                # Metadata builder, structured data
│   ├── types/              # Shared TypeScript types
│   └── utils/              # slug, format, affiliate, cn helpers
├── prisma/
│   └── schema.prisma       # Database schema
├── scripts/
│   ├── ingest-rss.ts       # Standalone RSS ingestion script
│   ├── seed.ts             # Demo data seeder
│   └── score-updater.ts    # Flags stale scores for review
├── public/                 # Static assets
├── middleware.ts            # Auth middleware for /admin routes
├── vercel.json             # Cron job config for ingestion
└── .env.example            # Environment variable reference
```

## Environment Variables

| Variable | Description | Example | Required |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/comparaia` | Yes |
| `JWT_SECRET` | Secret for signing JWT tokens (min 32 chars) | `some-long-random-string-here` | Yes |
| `ADMIN_EMAIL` | Initial admin user email | `admin@comparaia.es` | Yes |
| `ADMIN_PASSWORD` | Initial admin user password | `secure-password` | Yes |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL | `https://comparaia.es` | Yes |
| `NEXT_PUBLIC_SITE_NAME` | Site display name | `ComparaIA` | Yes |
| `REVALIDATE_SECRET` | Webhook secret for on-demand revalidation | `another-random-string` | Yes |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible Analytics domain (cookieless) | `comparaia.es` | No |
| `INDEXNOW_KEY` | IndexNow API key for faster search indexing | `abc123...` | No |
| `NEXT_PUBLIC_COOKIE_POLICY_VERSION` | Cookie consent policy version tag | `2025.1` | No |

## Editorial Workflow

1. **RSS Ingest** — Run `npm run ingest` (or wait for the Vercel Cron to trigger). The script fetches all active sources, scores relevance, deduplicates by URL, and creates `Article` records with status `INGESTED`.

2. **Admin Queue** — Ingested articles appear in the admin queue at `/admin/queue`, sorted by priority score. Breaking news and articles mentioning known models rank higher.

3. **Editor Review** — An editor opens the article, uses `content/templates/article-draft.md` or `comparison-draft.md` as a guide, rewrites the body, sets `metaTitle`, `metaDescription`, and moves the status to `IN_REVIEW`.

4. **Approval** — A reviewer (REVIEWER or ADMIN role) reads the draft, submits an `EditorialReview` decision (`APPROVED`, `REJECTED`, or `REVISION_NEEDED`). Approved articles move to `APPROVED` status.

5. **Publish** — An admin sets `publishedAt` and moves the article to `PUBLISHED`. Next.js ISR revalidates the page. On-demand revalidation is also available via the `/api/revalidate` webhook.

## Scoring System

Each AI model is scored per use case (e.g., coding, writing, reasoning) across weighted criteria defined in `ScoringCriteria`. Scores are stored in `ModelScore` with a `confidence` level:

| Confidence | Meaning |
|---|---|
| `VERIFIED` | Sourced from a published benchmark with a URL |
| `COMMUNITY` | Crowd-sourced or aggregated from community tests |
| `ESTIMATED` | Editorial estimate based on available information |
| `PLACEHOLDER` | Not yet evaluated — shown grayed out in UI |

The scoring engine (`lib/scoring/engine.ts`) normalizes raw values to a 0–10 scale and applies criteria weights to produce a composite score per use case. Scores older than 90 days are flagged as stale by `npm run score:update`.

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Required environment variables in Vercel dashboard:
# DATABASE_URL, JWT_SECRET, REVALIDATE_SECRET, NEXT_PUBLIC_SITE_URL
```

Cron jobs are configured in `vercel.json`. The RSS ingest runs automatically on the schedule defined there. You can also trigger it manually with `npm run ingest`.

## Database Commands

```bash
npm run db:migrate    # Run migrations
npm run db:seed       # Seed demo data
npm run db:studio     # Open Prisma Studio
npm run ingest        # Run RSS ingestion manually
npm run score:update  # Flag stale scores
```

## Legal Note

The legal documents in `content/legal/` are starting points only. They must be reviewed and approved by a qualified Spanish lawyer before use in production. ComparaIA is not a law firm and these documents do not constitute legal advice.

## Launch Checklist

- [ ] Configure `DATABASE_URL` (PostgreSQL on Supabase, Railway, or Neon)
- [ ] Set `JWT_SECRET` (min 32 chars random string)
- [ ] Set `REVALIDATE_SECRET`
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your domain
- [ ] Run `prisma migrate dev` + `npm run db:seed`
- [ ] Review and update legal documents with a lawyer
- [ ] Set up admin user (update seed or add via Prisma Studio)
- [ ] Configure Google AdSense (optional, requires cookie consent)
- [ ] Add affiliate links for tools you cover
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Vercel Cron for RSS ingestion (`vercel.json` included)
- [ ] Configure domain DNS
