# Project Status

Updated: 2026-10-22

## Current state

- The 2026-09-30 nearby/pharmacy-sync remediation (`scripts/sync-pharmacies.ts`, `src/app/api/nearby/route.ts`, `src/app/nearby/NearbyClient.tsx`, `src/app/page.tsx`, `src/lib/data/pharmacies.ts`, `tests/unit/remediation.test.ts`) was committed (`ae12bfd`), documented (`1b14037`, `ee65d59`), and pushed to `origin/main`.
- 2026-10-08 security dependency maintenance: upgrading `next` (`^16.3.8`), `eslint-config-next` (`^16.3.8`), `sanitize-html` (`^2.18.0`), and transitive dependencies (`sharp`, `qs`, `source-map-js`, `brace-expansion`) to resolve `npm audit` vulnerabilities.
- Public sitemap audit (`--since=2026-09-30`) confirmed 25 new medicine records (`2026-10-04`), 0 supplement records, and 0 blog records since the 2026-09-30 cutoff.
- 2026-10-22 AdSense prep (branch `claude/brave-volta-tg9ct9`): removed root/pharmacy/city `loading.tsx` (fixed CLS from streamed fallbacks and soft-404/soft-redirect 200 responses; locally 404 + noindex and server 308), collapsed SSR `EditorialToc`, header toggle nowrap, LCP image `fetchPriority`, aligned `isIndexablePharmacy` with sitemap predicate, removed tracked build logs. Local prod build: CLS 0 on 6 pages. Not pushed/deployed.
- 2026-10-22 findings: pharmacy enrichment 0/26,229 (keep `PHARMACY_INDEX_REQUIRES_ENRICHMENT` off); GSC 28-day impressions 0, Google picked `www` canonical for home (last crawl 08-23), stale `/sitemap-index.xml` submission. See `docs/site-quality/ADSENSE_READINESS_REVIEW.md`.
- Manual production writes/workflow dispatch/content publication/Vercel actions: not performed.

## Current validation target

- ESLint (`npm run lint`)
- application and script TypeScript checks (`tsc --noEmit`, `tsconfig.sync.json`)
- unit and API-content tests (`npm run test`)
- production dependency audit (`npm audit --omit=dev`)
- Next.js production build (`npm run build`)

## Remaining external observation

- Current production Turso queue state remains credential-gated
- GA4, Search Console, Naver Search Advisor, and PageSpeed field measurements

Use [PROJECT_STATE.md](PROJECT_STATE.md) and `.goal-harness/` as the canonical detailed record. Older files under `docs/reports` are historical snapshots.
