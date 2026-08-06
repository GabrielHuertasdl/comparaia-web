#!/usr/bin/env bash
#
# Exercises the scheduled cron endpoints the way Vercel invokes them:
# a GET carrying `Authorization: Bearer $CRON_SECRET`.
#
# Checks the three cases that matter — no credentials, wrong credentials,
# and the real secret — so a regression that opens the endpoints up is
# visible rather than silent.
#
# Usage:
#   ./scripts/test-cron.sh          # against http://localhost:3000
#   ./scripts/test-cron.sh prod     # against the Vercel production alias
#
# Secrets are read from .env (gitignored): CRON_SECRET for local,
# CRON_SECRET_PROD for production. Nothing is printed.

set -uo pipefail

cd "$(dirname "$0")/.."

TARGET="${1:-local}"
PROD_URL="https://comparaia-ghuertas.vercel.app"

case "$TARGET" in
  local) BASE="http://localhost:3000"; SECRET_VAR="CRON_SECRET" ;;
  prod)  BASE="$PROD_URL";             SECRET_VAR="CRON_SECRET_PROD" ;;
  *)     echo "Usage: $0 [local|prod]" >&2; exit 2 ;;
esac

if [[ ! -f .env ]]; then
  echo "No .env found. Copy .env.example and fill it in." >&2
  exit 1
fi

SECRET=$(grep "^${SECRET_VAR}=" .env | head -1 | cut -d= -f2- | tr -d '"')

if [[ -z "$SECRET" ]]; then
  echo "${SECRET_VAR} is not set in .env" >&2
  exit 1
fi

ENDPOINTS=(
  "/api/scores/update-stale"
  "/api/editorial/ingest"
)

RED=$'\033[31m'; GREEN=$'\033[32m'; DIM=$'\033[2m'; BOLD=$'\033[1m'; OFF=$'\033[0m'

failures=0

# check <expected-status> <label> <curl args...>
check() {
  local expected="$1" label="$2"; shift 2
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 90 "$@")

  if [[ "$code" == "$expected" ]]; then
    printf '  %sPASS%s  %-28s %s\n' "$GREEN" "$OFF" "$label" "$code"
  else
    printf '  %sFAIL%s  %-28s %s (expected %s)\n' "$RED" "$OFF" "$label" "$code" "$expected"
    failures=$((failures + 1))
  fi
}

printf '%sCron endpoint check%s %s(%s)%s\n\n' "$BOLD" "$OFF" "$DIM" "$BASE" "$OFF"

for path in "${ENDPOINTS[@]}"; do
  printf '%s%s%s\n' "$BOLD" "$path" "$OFF"

  check 401 "no credentials"   "$BASE$path"
  check 401 "wrong secret"     -H "Authorization: Bearer wrong-secret" "$BASE$path"
  check 200 "valid cron secret" -H "Authorization: Bearer $SECRET" "$BASE$path"

  printf '\n'
done

printf '%sResponse from %s:%s\n' "$BOLD" "${ENDPOINTS[0]}" "$OFF"
curl -s --max-time 90 -H "Authorization: Bearer $SECRET" "$BASE${ENDPOINTS[0]}" \
  | python3 -c '
import json, sys
d = json.load(sys.stdin)["data"]
print("  stale threshold (days):               ", d["staleAfterDays"])
print("  scores downgraded to ESTIMATED:       ", d["downgradedCount"])
print("  model x use-case combos with no data: ", d["missingCoverageCount"])
' 2>/dev/null || echo "  (no parseable response — see the FAIL lines above)"

printf '\n'

if (( failures > 0 )); then
  printf '%s%d check(s) failed.%s\n' "$RED" "$failures" "$OFF"
  exit 1
fi

printf '%sAll checks passed.%s\n' "$GREEN" "$OFF"
