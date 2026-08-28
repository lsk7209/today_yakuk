# CHANGELOG

| File | Change | Reason |
|---|---|---|
| `src/app/sitemap/*`, `src/app/sitemap-index.xml/route.ts`, `src/lib/sitemap-*.ts` | replaced build-time sitemap generation with validated runtime index/child routes and meaningful dates | prevent stale data snapshots and false freshness signals |
| `src/lib/pharmacy-indexability.ts`, pharmacy/region/wiki routes | centralized public-record requirements and repaired canonical, pagination and invalid-state controls | align discovery with indexable, usable pages |
| `src/app/layout.tsx`, `src/components/seo/json-ld.tsx`, `src/app/robots.ts`, manifest/public AI files | removed obsolete SearchAction and false real-time signals; corrected crawl and entity hints | improve truthful search and answer-engine interpretation |
| home/nearby/pharmacy cards and content CTAs | added direct phone/directions/nearby paths with mobile-size controls | reduce steps from discovery to contact intent |
| `src/lib/client-analytics.ts`, analytics tracker/API | added typed conversion events, privacy normalization, same-origin validation and rate limiting | measure the funnel without transmitting search terms, phone numbers or coordinates |
| reviewed fever/hangover pages | removed procedural medical schema and unsafe self-directed substitution/alternation language | lower YMYL risk and align snippets with visible content |
| `tests/unit/remediation.test.ts`, `tests/e2e/conversion.spec.ts` | added SEO, privacy, medical and end-to-end conversion regressions | make acceptance behavior reproducible |
| `.goal-harness/*` | Added repository-review goal, plan, evidence, risks, file map and final review | durable evidence and resumability |
| `PROJECT_STATE.md` | Added canonical project state with validation results and prioritized next actions | future-session continuity |
| `src/lib/content-update.ts`, admin queue route/data layer | strict update schema and field allowlist | prevent unknown-field SQL construction |
| `src/lib/safe-highlight.ts`, pharmacy detail page | escape-first text highlighting | prevent stored XSS from DB/API strings |
| `src/lib/hff-upsert.ts`, HFF fetch script | source-only upsert ownership | preserve derived enrichment |
| `src/lib/geo-bounds.ts`, nearby API | bounded radius and latitude-aware longitude bounds | correct and constrain nearby queries |
| `package*.json` | upgraded XML/transitive dependencies and added unit command | remove confirmed dependency findings and prove behavior |
| `tests/unit/remediation.test.ts`, `tests/e2e/*` | focused regressions and stable navigation/category assertions | behavioral proof |
| `.github/workflows/*` | removed stopped generation schedule, aligned publishing cadence, surfaced command failures | cost and automation integrity |
| `.gitignore` | ignored Playwright generated reports | keep verification artifacts out of Git |
| `package*.json`, ESLint/Next config, `src/proxy.ts`, async route/page props | migrated Next 14 to 16.3.3 and removed full-audit findings | supported runtime and reproducible audit 0 |
| `src/lib/sanitize-html.ts`, JSON-LD consumers | replaced regex HTML filtering with allowlist sanitizer and escaped dynamic JSON-LD | close stored/reflected XSS bypasses |
| public-data scripts | changed government endpoints to HTTPS and made partial/total failures exit nonzero | protect API keys/data integrity and stop false-green workflows |
| workflow dispatch inputs | moved expressions to env, validated allowlists/ranges and quoted argv | prevent Actions shell/output injection |
| `playwright.config.ts`, affiliate banner | isolated DB/network and deferred measurement script until hydration | deterministic E2E and no hydration overlay |
| `scripts/enrich-from-hff-excel.ts`, `xlsx` | removed unused machine-specific script and dependency | eliminate unfixable audit surface; recoverable from Git history |
| Next.js-generated `AGENTS.md` block | retained version-specific local documentation pointer | prevent `next dev` from recreating a dirty tracked change |

## Changed Files

| File | Change | Reason |
|---|---|---|
| `content/data-audits/2026-08-28.json` | added a read-only follow-up snapshot, zero-delta interpretation, duplicate scope and content decision | keep public/API evidence reproducible without implying new regulatory records |
| `src/app/blog/data-update-2026-08/page.tsx`, `src/app/blog/supplement-label-reading-guide/page.tsx` | updated the monthly draft and added one original noindex label-reading guide | provide useful evergreen navigation while keeping unpublished content out of search |
| `src/lib/wiki-nutrition.ts`, wiki detail/list/tag/compare/search surfaces | exposed only C003-source-marked nutrition facts and removed generated summaries as public evidence | prevent name-derived or unproven health information from affecting users and indexing |
| nutrition enrichment/sync scripts and workflow | made zero facts a no-write, disabled name-only jobs, validated partial syncs and added cursor rotation | stop false-green data loss and first-page starvation |
| analytics tracker and conversion E2E | added readiness signalling and asserted the real guide CTA payload | remove hydration timing flakiness and prove conversion measurement |
| duplicate auditor and unit/E2E tests | fixed declaration-only slug matching and expanded integrity/content regressions to 22 unit and 30 browser checks | make duplicate, provenance, no-write and rendering claims reproducible |
| `.goal-harness/*`, `PROJECT_STATE.md` | synchronized outcome, evidence, risks, review and next boundary | allow a later session to resume without overstating live release state |

## 2026-08-28 Scheduled-content follow-up

| File | Change | Reason |
|---|---|---|
| `content/schedule-audits/2026-08-28.json` | added point-in-time run/slot evidence, content brief, duplicate counts and explicit DB/remote boundaries | answer the exact last-scheduled question without treating a log as current production state |
| `.github/workflows/generate-blog.yml` | removed automatic cron and retained `workflow_dispatch` | stop unchecked external-generated body copy from automatically extending the queue while preserving deliberate manual operation |
| `src/app/blog/supplement-additives-label-guide/page.tsx` | added a direct-Codex static noindex guide with official sources, internal links and nearby CTA | fill a low-overlap label-interpretation gap without prematurely publishing YMYL content |
| `src/components/wiki/AdditiveSignal.tsx` | linked the on-page signal to the interpretation guide and repeated the absence/safety boundary | reduce product-detail misinterpretation |
| `src/lib/scheduler.ts` | replaced minute-bump branching with strict comparison against 00/06/12 UTC candidates | avoid skipping an imminent slot at 05:59:59.999 or 23:59:59.999 and make next-slot evidence executable |
| `tests/unit/remediation.test.ts`, `tests/e2e/data-update.spec.ts` | added scheduler boundary, AdditiveSignal three-state render, workflow, manifest, indexing, claim, source, schema and CTA regressions | prove local safety and conversion behavior on desktop/mobile |
| `.goal-harness/*`, `PROJECT_STATE.md` | recorded exact evidence, limitations, tests and handoff state | make the follow-up resumable without overstating reservation/publication/release |
## 2026-08-28 completion follow-up

| File | Change | Reason |
|---|---|---|
| `src/lib/turso.ts`, public-data scripts | added required-client path | prevent false-green no-op writes |
| schema and publication scripts/workflow | propagated failures and added conditional claims/concurrency | prevent partial success and duplicate publication |
| nearby route and wiki indexability/tag page | ordered bounded candidates and shared public predicate | preserve nearest and indexable results |
| package scripts, CI, unit tests | added standard commands, continuous checks, runtime claim/predicate tests | make proof repeatable |
| README, STATUS, docs map/guides, `.env.example` | updated current setup and safety boundaries | remove stale or unsafe guidance |
