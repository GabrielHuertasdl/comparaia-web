# ComparaIA

**Comparamos las IAs para que tú elijas mejor.** A Spanish-language editorial platform for comparing AI models and tools: news, head-to-head comparisons, rankings and an interactive, weighted comparator, backed by a human-in-the-loop RSS editorial pipeline.

![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Radix-000000?logo=shadcnui&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-deployed-000000?logo=vercel&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Postgres_dev-2496ED?logo=docker&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## Overview

ComparaIA is a digital publication (target domain `comparaia.es`, locale `es-ES`) that helps Spanish-speaking users pick the right AI model or tool for a concrete use case. It combines:

- **Editorial content** — news, comparisons, guides and rankings, published through a review workflow with **no auto-publishing**: a human always reviews and presses "Publish".
- **A data-driven comparator** — models are scored per use case across weighted criteria, with an explicit confidence level for every score.
- **Programmatic SEO** — `/mejor-ia-para/[usecase]` landing pages (18 seeded use cases), JSON-LD structured data, sitemap and ISR.
- **Compliance with Spanish law** — LSSI, RGPD/LOPDGDD and the AEPD cookie guide (nothing pre-ticked, "Reject all" as visible as "Accept", ads only after consent).
- **Monetization hooks** — affiliate links with click tracking, ad slots gated by consent, newsletter.

The site is deployed on Vercel with a Neon serverless PostgreSQL database and scheduled cron jobs.

## Key features

- **RSS editorial pipeline** — ingest → URL de-duplication → keyword classification (vendor/category) and model-mention extraction → relevance scoring (breaking-news signals, benchmark keywords, authoritative domains, recency) → priority queue → human review → manual publish → audit log.
- **Review workflow** — article states `INGESTED → IN_REVIEW → APPROVED → PUBLISHED`; reviewers submit `APPROVED`, `REJECTED` or `REVISION_NEEDED` decisions; every action is audited.
- **Scoring engine** — per-use-case weighted criteria, raw values normalized to 0–10, composite score per model, worst-case confidence propagation, stale-score detection (> 90 days).
- **Interactive comparator** — wizard to pick a use case, adjust criteria weights and compare models, with Recharts visualizations and plain-language explanations.
- **Admin panel** (`/admin`) — dashboard, editorial queue, article editor, model and score editors, RSS source manager, tools catalogue. JWT auth in an HttpOnly cookie, enforced by Edge middleware.
- **Secure cron endpoints** — Vercel cron calls authenticated with `Authorization: Bearer $CRON_SECRET` (constant-time comparison, fail-closed when unset), plus `scripts/test-cron.sh` to verify the three cases (no / wrong / valid credentials).
- **SEO** — metadata builder, Article / Breadcrumb / FAQ / ItemList / SoftwareApplication JSON-LD, dynamic sitemap (tolerant to DB unavailability at build time), robots, IndexNow ping, on-demand revalidation webhook.
- **Security headers** — `X-Frame-Options: DENY`, `nosniff`, strict referrer policy, restrictive `Permissions-Policy`.

## Architecture

```mermaid
flowchart LR
    subgraph Vercel
        MW["Edge middleware<br/>JWT admin guard · cron secret"]
        APP["Next.js 14 App Router<br/>public site · /admin · 16 API routes"]
        CRON["Vercel Cron<br/>daily ingest · stale-score check"]
    end
    U[Readers] --> MW --> APP
    ED[Editors / reviewers] --> MW
    CRON -->|Bearer CRON_SECRET| MW
    APP --> PRISMA[Prisma ORM]
    PRISMA --> DB[("Neon PostgreSQL<br/>29 models · 11 enums")]
    APP -->|fetch feeds| RSS[(RSS sources)]
    APP -->|ping| IDX[IndexNow / search engines]
    APP -.->|after consent| ADS[AdSense · affiliate partners]
    APP -.-> PL[Plausible analytics<br/>cookieless]
```

ISR strategy: articles revalidate on publish (plus `/api/webhooks/revalidate`), rankings every hour, tool pages every 24 h.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, ISR, Edge middleware) |
| Language | TypeScript |
| UI | Tailwind CSS, shadcn/ui (Radix primitives), Lucide icons, Recharts, `next-themes`, Geist font |
| Data | Prisma 5, PostgreSQL (Neon serverless in production) |
| Auth | JWT via `jose`, password hashing with `bcryptjs` |
| Content ingestion | `rss-parser`, custom classifier / deduplicator / relevance scorer |
| Validation | Zod |
| Hosting | Vercel (cron jobs in `vercel.json`); Docker Compose for local PostgreSQL |

## Getting started

### Prerequisites

- Node.js 20+ and npm
- Docker (for the local PostgreSQL container) or any PostgreSQL connection string

### Quick start (Docker PostgreSQL)

```bash
cp .env.example .env     # edit secrets; DATABASE_URL must match the compose DB
./start.sh --seed        # starts Postgres in Docker, installs deps, migrates, seeds, runs dev
```

`start.sh` options: no flag = migrate + dev, `--seed` = also seed demo data, `--reset` = drop the DB volume and re-create everything (destructive). For the bundled compose database use `DATABASE_URL="postgresql://comparaia:comparaia_dev@localhost:5432/comparaia"`.

### Manual setup

```bash
npm install
cp .env.example .env              # or .env.local
docker compose up -d postgres     # or point DATABASE_URL at Neon / Supabase / Railway
npx prisma migrate dev            # npm run db:migrate
npm run db:seed                   # demo data + initial admin user
npm run dev                       # http://localhost:3000  (admin: /admin)
```

The seed script creates an admin user; set `SEED_ADMIN_PASSWORD` before seeding to choose its password.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | `prisma generate && next build` |
| `npm start` | Production server |
| `npm run lint` | ESLint |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:push` | `prisma db push` |
| `npm run db:generate` | `prisma generate` |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Prisma Studio |
| `npm run ingest` | Run RSS ingestion manually |
| `npm run score:update` | Flag stale scores |

### Environment variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for signing admin JWTs (min 32 chars) | Yes |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Initial admin user | Yes |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL | Yes |
| `NEXT_PUBLIC_SITE_NAME` | Site display name | Yes |
| `REVALIDATE_SECRET` | Secret for the on-demand revalidation webhook | Yes |
| `CRON_SECRET` | Bearer secret Vercel sends to cron endpoints (fail-closed if unset) | Yes (prod) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible Analytics domain (cookieless) | No |
| `INDEXNOW_KEY` | IndexNow API key for faster indexing | No |
| `NEXT_PUBLIC_COOKIE_POLICY_VERSION` | Cookie consent policy version tag | No |

## Editorial workflow

1. **RSS ingest** — `npm run ingest` or the daily Vercel cron (`/api/editorial/ingest`). Active sources are fetched, scored for relevance, de-duplicated by URL and stored as `Article` records with status `INGESTED`.
2. **Admin queue** — ingested articles appear at `/admin/cola`, sorted by priority score. Breaking news and articles mentioning known models rank higher.
3. **Editor review** — an editor rewrites the body using `content/templates/article-draft.md` or `comparison-draft.md`, sets `metaTitle` / `metaDescription` and moves the article to `IN_REVIEW`.
4. **Approval** — a reviewer (REVIEWER or ADMIN role) submits an `EditorialReview` decision: `APPROVED`, `REJECTED` or `REVISION_NEEDED`.
5. **Publish** — an admin publishes manually; ISR revalidates the page. On-demand revalidation is also available via `/api/webhooks/revalidate`.

## Scoring system

Each AI model is scored per use case (coding, writing, reasoning, …) across weighted criteria defined in `ScoringCriteria`. Scores are stored in `ModelScore` with a confidence level:

| Confidence | Meaning |
|---|---|
| `VERIFIED` | Sourced from a published benchmark with a URL |
| `COMMUNITY` | Crowd-sourced or aggregated from community tests |
| `ESTIMATED` | Editorial estimate based on available information |
| `PLACEHOLDER` | Not yet evaluated — shown greyed out in the UI |

The engine (`lib/scoring/engine.ts`) normalizes raw values to 0–10 and applies criteria weights to produce a composite score per use case. Scores older than 90 days are flagged as stale by `npm run score:update` and the daily `/api/scores/update-stale` cron.

## API routes

| Route | Purpose |
|---|---|
| `POST /api/admin/login` | Admin login, JWT in HttpOnly cookie |
| `GET/POST /api/editorial/sources` · `/[id]` | RSS source management |
| `GET/POST /api/editorial/ingest` | RSS ingestion (daily cron) |
| `GET /api/editorial/queue` | Publication queue |
| `POST /api/editorial/review/[id]` | Review decision |
| `POST /api/editorial/publish/[id]` | Manual publish |
| `POST /api/comparator` · `/score` · `GET /usecases` | Comparator |
| `PUT /api/scores/[criteriaId]` | Score editing |
| `GET/POST /api/scores/update-stale` | Stale-score check (daily cron) |
| `POST /api/newsletter/subscribe` | Newsletter sign-up |
| `GET /api/affiliate/track/[linkId]` | Affiliate redirect + click tracking |
| `POST /api/consent` | Cookie consent record |
| `POST /api/webhooks/revalidate` | On-demand ISR |

## Deployment (Vercel + Neon)

```bash
npm i -g vercel
vercel --prod
```

Set `DATABASE_URL`, `JWT_SECRET`, `REVALIDATE_SECRET`, `CRON_SECRET` and `NEXT_PUBLIC_SITE_URL` in the Vercel dashboard. Cron jobs are defined in `vercel.json` (daily, Hobby-plan compatible): RSS ingest at 08:00 and stale-score check at 06:00. Verify them with:

```bash
./scripts/test-cron.sh          # against http://localhost:3000
./scripts/test-cron.sh prod     # against the production deployment
```

### Launch checklist

- [ ] Configure `DATABASE_URL` (PostgreSQL on Neon, Supabase or Railway)
- [ ] Set `JWT_SECRET`, `REVALIDATE_SECRET` and `CRON_SECRET`
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the domain
- [ ] Run migrations + `npm run db:seed`
- [ ] Review the legal documents with a lawyer
- [ ] Configure Google AdSense (optional, requires cookie consent)
- [ ] Add affiliate links for the tools covered
- [ ] Submit the sitemap to Google Search Console
- [ ] Configure domain DNS

## Project structure

```
comparaia/
├── app/                    # App Router: public pages, /admin, /legal, api/
├── components/
│   ├── admin/              # ArticleEditor, EditorialQueue, ReviewPanel, ScoreEditor, SourceManager
│   ├── comparator/         # ComparatorWizard, CriteriaWeights, ResultsChart, ...
│   ├── editorial/ rankings/ tools/ cards/ home/ layout/
│   ├── legal/              # CookieBanner, ConsentManager, AffiliateDisclosure
│   ├── monetization/       # AdSlot, AffiliateBox, NewsletterSignup
│   ├── seo/                # JSON-LD components
│   └── ui/                 # shadcn/ui primitives
├── content/
│   ├── legal/              # Legal document drafts (aviso legal, privacidad, cookies, ...)
│   └── templates/          # Editorial templates (article / comparison drafts)
├── lib/
│   ├── editorial/          # Ingestor, classifier, deduplicator, relevance scorer
│   ├── scoring/            # Score engine, normalizer, types
│   ├── seo/                # Metadata builder, structured data
│   ├── auth.ts cron-secret.ts db.ts
│   └── constants/ hooks/ types/ utils/
├── prisma/                 # schema.prisma + migrations
├── scripts/                # seed, ingest-rss, score-updater, sitemap-ping, test-cron.sh
├── middleware.ts           # Admin + cron auth
├── vercel.json             # Cron schedule
├── docker-compose.yml      # Local PostgreSQL
└── start.sh                # Dev bootstrap
```

## Legal note

The legal documents in `content/legal/` are starting points only and must be reviewed by a qualified Spanish lawyer before production use; they do not constitute legal advice.

## License

[MIT](LICENSE) © 2026 Gabriel Huertas
