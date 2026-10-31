# CITY SIGNAL V2 — local implementation

Target: E:/web/todaypharm, supplied V2 brief/HTML/concept in D:/다운로드. Revision: 2026-10-23.

## Result
Paper/navy/coral shared tokens and Tailwind brand palette; original city-hours.svg replaces rendered metro art on home, nearby and shared headings; wiki illustration recolored. Home has the approved headline, stacked mobile search, linear desktop results, linked LOCAL FIELD NOTES and a known/unknown trust panel. Shared TimeStrip connects to actual operating_hours in home/card/detail, uses KST, labels weekday and current time, distinguishes invalid/missing/equal times, and shows actual previous-weekday overnight spill rather than painting tomorrow's hours today. No prototype pharmacy names/data were copied into production components.

Wiki collection list/count queries now share the existing supplement indexability predicate with details/sitemaps. Existing semantics retain tag-only informational records without pretending they have verified nutrient quantities; invalid stored nutrient records are excluded. Count read failures propagate rather than cache zero. No schema, production data or account changes.

## Changed files
- src/app/city-signal.css, tailwind.config.ts: V2 palette/layout/ribbon/trust styles.
- src/app/page.tsx: hero, city art, search results and field-note destinations; render-time ref lint repair.
- src/components/city-signal/time-strip.tsx: reusable factual hour ribbon.
- src/components/pharmacy-card.tsx, pharmacy-hours.tsx: real schedule ribbon integration.
- src/components/city-signal/page-heading.tsx, src/app/nearby/NearbyClient.tsx: city silhouette.
- src/components/home/home-trust-sections.tsx: known/unknown data panel.
- src/app/wiki/page.tsx, src/app/wiki/tag/[keyword]/page.tsx: verified collection predicates and count failure behavior.
- public/city-signal/city-hours.svg, wiki-grid.svg: local original city art and V2 colors.
- src/app/blog/pregnancy-pharmacy-guide/page.tsx: JSX quotation escaping only; no medical guidance was validated or changed.
- tests/unit/remediation.test.ts: executable SQLite collection-gate regression.
- tests/city-signal/design.spec.ts: new headline, visible status selection, actual blog TOC target, configurable capture root.
- tests/city-signal/time-strip.spec.ts: invalid/missing/equal/overnight and midnight ribbon regressions.
- tests/fixtures/city-signal-server.mjs: optional isolated artifact root.
- tests/city-signal-v2*.playwright.config.ts: isolated four-width and P0 checks.

## Validation
Fresh checks: npm test PASS (47 remediation cases plus nutrition/schedule/draft/API suites), npm run lint PASS, npx tsc --noEmit PASS. Full four-width browser suite PASS 108/108, no skipped/flaky; final CSS/ribbon screenshot recheck PASS 16/16; P0 clock/timezone/closing-order/prescription suite PASS 14/14. Offline final build PASS,58 static outputs, recorded in build.log; dummy-client notice confirms no operational DB use. Owned test ports3256/3258 have no listeners at finish. Authoritative evidence is .goal-harness/city-signal-v2-20261023/runtime. Commands: npm test; npm run lint; npx tsc --noEmit; npm run build with TURSO variables cleared in command process; npx playwright test --config tests/city-signal-v2.playwright.config.ts; same config --grep 'home: responsive|header keyboard|ribbons|after midnight'; npx playwright test --config tests/city-signal-v2-p0.playwright.config.ts. Browser JSON: results.json, recheck.log (JSON stdout), p0/results.json. Main opened full home mobile/narrow, pharmacy mobile, desktop home crop, desktop/mobile 20-template contact sheets, and desktop/mobile result-strip captures. All tested templates had no horizontal overflow and no pageerror. 

Tests use synthetic local SQLite only and block browser requests to external origins. Fixture images are test evidence, not production content proof.

Initial validation failures are retained in session output: webServer cwd incorrectly resolved tests/tests (fixed by explicit root cwd), hidden home image (mobile artwork now visible), status locator matched two live regions (scoped to visible div), guide TOC test targeted a guide without TOC (now checks actual blog TOC). Interrupted first passes are not counted as success. Restarted only task-owned runner/server processes after an orphaned server stopped answering. No broader process cleanup.

## Review and limitations
Independent review found nearby grid leakage, midnight ribbon mismatch and cached false zero count. All three repaired; narrow re-review APPROVE, zero remaining findings.

Existing ingestion has one updated_at field, not independently evidenced source/observed timestamps. No field-observed status or live stock is manufactured. Calendar-specific holiday overrides cannot be inferred from weekday data: every ribbon explicitly labels weekday registration and holiday/actual-operation phone verification. Automatic holiday-calendar integration and ingestion schema separation remain unimplemented. Named source defects cannot be confirmed against production DB in this local-only run. Existing medical articles (including pregnancy article's garbled preceding sentence) require a separate expert/source content audit; only JSX escaping was done. No claim of medical review, production data repair, AdSense approval, full content certification or measured field CWV.

임씨_개발실무_적용기준_v1.md was not found by bounded file search. Installed Next CSS guide was read. Original v1/unrelated untracked work and durable evidence are preserved. No new dependencies.

## Operation and rollback
Prepared source only: no commit, push, deployment, production DB/cache/cron/ad account mutation. An explicitly authorized release should reconcile this checkout with the deployed app, review the exact diff, run staging checks with approved data and only then deploy. Keep the previous deployment available. Roll back through a narrow reverse patch/revert of V2-owned files after preserving later edits; never reset or delete unrelated work or evidence. No DB migration rollback is needed.

## 내가 내린 결정
Use the supplied V2 visual direction in this identified checkout; preserve existing routes/policies and known factual data contracts. Keep API ingestion/content generation outside this run while the optional start-of-session question is unanswered. Public operational data remains unverified.
