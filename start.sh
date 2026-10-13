#!/usr/bin/env bash
# ComparaIA — dev bootstrap
# Usage: ./start.sh [--seed] [--reset]
#   --seed   seed demo data after migrate (skipped if already seeded)
#   --reset  drop DB volume + recreate (DESTRUCTIVE)

set -e

SEED=false
RESET=false

for arg in "$@"; do
  case $arg in
    --seed)  SEED=true ;;
    --reset) RESET=true ;;
  esac
done

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# ── 1. .env check ──────────────────────────────────────────────────────────────

if [ ! -f .env ]; then
  echo "[start] No .env found — copying .env.example"
  cp .env.example .env
  echo "[start] Edit .env with your secrets, then re-run."
  exit 1
fi

# ── 2. Docker (PostgreSQL only) ────────────────────────────────────────────────

echo "[start] Starting PostgreSQL..."

if [ "$RESET" = true ]; then
  echo "[start] --reset: removing postgres volume (DESTRUCTIVE)"
  docker compose down -v --remove-orphans 2>/dev/null || true
fi

docker compose up -d postgres

echo "[start] Waiting for PostgreSQL to be ready..."
until docker compose exec postgres pg_isready -U comparaia -q 2>/dev/null; do
  sleep 1
done
echo "[start] PostgreSQL ready."

# ── 3. npm install ─────────────────────────────────────────────────────────────

if [ ! -d node_modules ]; then
  echo "[start] node_modules missing — running npm install..."
  npm install
fi

# ── 4. Prisma migrate ──────────────────────────────────────────────────────────

echo "[start] Running Prisma migrations..."
npx prisma migrate dev --skip-generate 2>&1 | grep -v "^$" || true
npx prisma generate

# ── 5. Seed (optional) ─────────────────────────────────────────────────────────

if [ "$SEED" = true ] || [ "$RESET" = true ]; then
  echo "[start] Seeding database..."
  npm run db:seed
fi

# ── 6. Start Next.js dev server ────────────────────────────────────────────────

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ComparaIA dev server starting..."
echo "  http://localhost:3000"
echo "  Admin: http://localhost:3000/admin"
echo "  Login: admin@comparaia.es (password printed by the seed step, or SEED_ADMIN_PASSWORD)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run dev
