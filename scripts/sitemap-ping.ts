/**
 * ComparaIA — Sitemap Ping
 *
 * Notifies Bing (IndexNow) and the IndexNow consortium (which includes Google)
 * after a new page is published.
 *
 * Usage:
 *   tsx scripts/sitemap-ping.ts <slug>
 *
 * Environment variables required:
 *   INDEXNOW_KEY   — Your IndexNow verification key
 *   SITE_URL       — Base URL of the site (default: https://comparaia.es)
 */

const slug = process.argv[2];

if (!slug) {
  console.error('[sitemap-ping] Error: slug argument is required.');
  console.error('  Usage: tsx scripts/sitemap-ping.ts <slug>');
  process.exit(1);
}

const INDEXNOW_KEY = process.env.INDEXNOW_KEY;
const SITE_URL = (process.env.SITE_URL ?? 'https://comparaia.es').replace(/\/$/, '');

if (!INDEXNOW_KEY) {
  console.error('[sitemap-ping] Error: INDEXNOW_KEY environment variable is not set.');
  process.exit(1);
}

const pageUrl = `${SITE_URL}/${slug}`;
const keyLocation = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

const payload = {
  host: new URL(SITE_URL).hostname,
  key: INDEXNOW_KEY,
  keyLocation,
  urlList: [pageUrl],
};

// IndexNow endpoints — Bing hosts the primary; api.indexnow.org distributes to all
// participating search engines (Bing, Yandex, Seznam, and Google via partnership).
const ENDPOINTS = [
  { name: 'Bing IndexNow', url: 'https://www.bing.com/indexnow' },
  { name: 'IndexNow (consortium)', url: 'https://api.indexnow.org/indexnow' },
];

async function ping(name: string, endpointUrl: string): Promise<void> {
  console.log(`[sitemap-ping] Pinging ${name}...`);
  console.log(`  URL to index: ${pageUrl}`);
  console.log(`  Endpoint:     ${endpointUrl}`);

  const res = await fetch(endpointUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  const statusText = `${res.status} ${res.statusText}`;

  // IndexNow returns 200 or 202 on success; 400 = bad request; 403 = bad key; 422 = bad URL
  if (res.ok || res.status === 202) {
    console.log(`  [OK] ${name} accepted the ping — HTTP ${statusText}`);
  } else {
    let body = '';
    try {
      body = await res.text();
    } catch {
      // ignore
    }
    console.error(`  [FAIL] ${name} rejected the ping — HTTP ${statusText}`);
    if (body) {
      console.error(`  Response body: ${body}`);
    }
  }
}

(async () => {
  console.log(`[sitemap-ping] Notifying search engines about: ${pageUrl}`);

  for (const endpoint of ENDPOINTS) {
    try {
      await ping(endpoint.name, endpoint.url);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  [ERROR] ${endpoint.name} — ${message}`);
    }
  }

  console.log('[sitemap-ping] Done.');
})();
