# FILEMAP

- `src/app/`: Next.js App Router pages and API routes; public pharmacy search, blog/wiki, admin.
- `src/lib/data/`: Turso-backed repositories for pharmacy/content/wiki data.
- `src/lib/turso.ts`: environment-based Turso client with empty dummy client fallback.
- `src/proxy.ts`, `src/lib/jwt.ts`: Next.js 16 proxy-based admin JWT protection and bot query filtering.
- `scripts/`: public-data ingestion, AI content generation, queue publishing, GSC and cost checks.
- `.github/workflows/`: scheduled ingestion, generation, schema and publication jobs.
- `tests/unit/`: security, data ownership, route boundary and workflow contract regressions.
- `tests/e2e/`: isolated homepage/wiki Playwright coverage for desktop and mobile.
- `supabase/`, `turso-schema.sql`: historical/current database schema assets.
- `.goal-harness/`: this review's goal, evidence, risks and acceptance record.

## Existing Files

| File | Role | Notes |
|---|---|---|

## New Files

| File | Role | Notes |
|---|---|---|
| `content/data-audits/2026-08-28.json` | follow-up data evidence | public sitemap/Actions snapshot; read-only and point-in-time |
| `src/app/blog/supplement-label-reading-guide/page.tsx` | unpublished evergreen guide | `noindex,nofollow`; excluded from blog registry and sitemap |
| `src/lib/wiki-nutrition.ts` | nutrition provenance boundary | only `foodsafetykorea:C003` positive facts are public-verifiable |
| `scripts/lib/supplement-enrichment.ts` | enrichment persistence contract | zero-fact no-write and rotating selection offset |

## 2026-08-28 API delta/content touchpoints

- `src/app/wiki/product/[id]/page.tsx`, `src/app/wiki/vs/[compareId]/page.tsx`: verified nutrition rendering only.
- `src/lib/wiki-indexability.ts`: source-marked nutrition signal and guarded JSON extraction.
- `scripts/auto-enrich-supplements.ts`, `scripts/sync-supplements.ts`: fail-closed writes and selection rotation.
- `scripts/enrich-from-product-name.ts`, `scripts/re-enrich-empty.ts`, `scripts/fill-missing-summaries.ts`: unsafe name-only jobs disabled.
- `tests/unit/remediation.test.ts`, `tests/e2e/data-update.spec.ts`, `tests/e2e/conversion.spec.ts`: data integrity, draft, CTA and timing regressions.

## 2026-08-28 Scheduled-content touchpoints

- `content/schedule-audits/2026-08-28.json`: last-run and next-slot point-in-time evidence; no DB mutation.
- `.github/workflows/generate-blog.yml`: manual-only future blog generation; existing queue publishing remains elsewhere.
- `src/lib/scheduler.ts`: strict future-slot calculation for 00/06/12 UTC.
- `src/app/blog/supplement-additives-label-guide/page.tsx`: unpublished, noindex interpretation guide written directly in Codex.
- `src/components/wiki/AdditiveSignal.tsx`: product-detail explanation path.
- `tests/unit/remediation.test.ts`: live scheduler-boundary, AdditiveSignal render, schedule manifest/workflow and unlisted-content contracts.
- `tests/e2e/data-update.spec.ts`: desktop/mobile rendering, claim boundary, sources, schema and conversion event.
