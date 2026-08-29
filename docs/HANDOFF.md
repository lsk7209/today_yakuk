# Current Handoff

Updated: 2026-08-30 00:43 KST

## User goal

Audit and improve the managed SEO fleet, using the latest GitHub `main` as the source of truth for Todaypharm and preserving the user's dirty original checkout.

## Exact current state

- Isolated release clone: `D:\web\seo-worktrees\todaypharm-publish-pipeline-20260829`
- Runtime release SHA: `507e892f0675f6d8bbdf4b46fa70a4419327b65f` on `main`; this handoff update is documentation-only.
- Reproduced production automation defect: scheduled Publish Content Queue run `33256826221` failed before publication because `.github/workflows/publish-content.yml` called the missing `npm run db:init` script.
- The original checkout `D:\web\todaypharm` is diverged and dirty; it has not been modified by this repair.
- The first repair is live: GitHub CI run `33259114351` and Git-connected Production deployment `6156978896` both succeeded for `da8d44c`.
- The blog-shell follow-up is live: CI `33260457513`, Hosting Cost Guard `33260457490`, and Production deployment `6157245458` succeeded for `e182e10`.
- The reviewer closure is live: CI `33260795865`, Hosting Cost Guard `33260795870`, and Production deployment `6157310775` succeeded for exact SHA `507e892`.
- Current production `/blog` literal HTML contains the H1 and static guide links for both Browser and Googlebot. Page 2 is crawlable but `noindex, follow`; unsafe bot query shapes remain 403.

## Completed work

- Added `db:init` to `package.json`, mapped to the existing fail-closed `scripts/init-turso-schema.mjs` implementation.
- Added a static regression contract proving that the workflow command and package script remain connected.
- Confirmed the latest scheduled public-data sync succeeded and added 17 pharmacy rows (`26006 -> 26023`) with public detail verification.
- Confirmed this repair does not need a new data-content article: the confirmed delta is operational pharmacy data, while Search Console still reports zero impressions and requires a separate indexing investigation before broad content generation.
- Refactored `/blog` so its authored H1, description, and curated guide links render synchronously before the Suspense boundary; DB-backed posts, count, pagination, and dynamic ItemList remain in the async child.
- Removed the stale `generate:images` package alias whose target was intentionally deleted, and added a unit contract that all package-referenced local scripts exist.
- Added a raw-response Playwright regression for literal H1 and a representative curated internal link.
- Reconciled crawler controls: bounded blog/wiki pagination and curated wiki-category states can pass, while search queries, unknown keys, APIs, duplicate parameters, malformed pages, and pages over 10,000 remain blocked for bot UAs.
- Closed the independent HIGH finding: arbitrary tag pagination is now explicitly blocked for bots in both proxy and robots.txt; wiki categories use the exact eight-value UI allowlist; malformed values such as `page=2abc` normalize to page 1 for normal users and remain blocked for bots.

## Changed files

- `package.json`
- `tests/unit/remediation.test.ts`
- `src/app/blog/page.tsx`
- `tests/e2e/wiki.spec.ts`
- `src/proxy.ts`
- `src/app/robots.ts`
- `.goal-harness/STATUS.md`
- `.goal-harness/EVIDENCE.md`
- `STATUS.md`
- `PROJECT_STATE.md`
- `docs/HANDOFF.md`

## Fresh validation evidence

- `npm ci`: pass; 513 packages audited, 0 vulnerabilities.
- `npm run test:unit`: pass, 31/31.
- `npm run lint`: pass.
- `npx tsc --noEmit`: pass.
- `npx tsc --noEmit --project tsconfig.sync.json`: pass.
- Empty-credential `npm run db:init`: expected nonzero exit, recorded as `DB_INIT_EMPTY_ENV_FAIL_CLOSED=PASS`; no network or DB mutation.
- `npm run build`: pass; Next.js 16.3.3 compiled and generated 57 pages.
- Targeted Playwright: pass, 10/10 desktop/mobile.
- Full Playwright on isolated port 3107: pass, 32/32 desktop/mobile. The initial port-3000 run was discarded because an unrelated local app answered as `아이템79` and then stopped.
- After the crawler-policy repair, targeted Playwright passed 10/10 and the full isolated suite passed 32/32 again.
- Isolated production-mode raw responses: Browser and Googlebot `/blog` and `/blog?page=2` returned 200 with one literal H1, curated link, correct canonical, and `index, follow`/`noindex, follow`; unsafe bot queries remained 403.
- Reviewer closure repeated unit 31/31, lint, both typechecks, targeted Playwright 10/10, full Playwright 32/32, build 57, and production-mode raw checks including tag/query blocks and robots parity.
- Exact-SHA GitHub verification: CI `33260795865` and Hosting Cost Guard `33260795870` passed for `507e892`.
- Exact-SHA Git-connected deployment: Production `6157310775` succeeded for `507e892`.
- Public canonical-domain raw responses: Browser and Googlebot `/blog` and `/blog?page=2` returned 200 with literal H1/static link and correct canonical/robots; Browser `page=2abc` normalized to canonical `/blog`; Googlebot search, tag pagination, extra-key, and page 10001 requests returned 403; robots.txt contains the explicit tag-pagination disallow.
- The natural push-triggered Indexing Notification Outbox run `33260869070` succeeded and reported `selected=0 succeeded=0 failed=0`; it was not manually dispatched and did not send indexing notifications or publish content.
- `git diff --check`: pass; only Windows line-ending notices.

## Side effects and rollback

- Local dependencies/build output were created in the isolated clone only and are ignored by Git.
- No manual production DB/API write, content publication, workflow dispatch, Vercel CLI/API mutation, or manual deployment was performed. GitHub/Vercel automation ran only as the normal consequence of the authorized push.
- After release, rollback is a normal revert of the repair commit; do not reset or overwrite the dirty original checkout.

## Blockers and risks

- The fix cannot be proven against production credentials without running a DB-writing publication workflow. Do not dispatch it manually under this scope; use the next natural scheduled run as operational proof.
- GSC reports 0 impressions while 31,591 URLs are submitted. Treat this as a separate indexing/coverage gate, not proof that the content is poor.
- The route remains dynamically rendered because it still uses `searchParams` and DB data; the repair proves a useful literal HTML shell, not full static prerendering or a Core Web Vitals improvement.
- GitHub Actions currently warns that Node.js 20 actions are being forced onto Node.js 24; it did not fail this release but should be handled as routine workflow maintenance.

## Single next step

Return to the fleet SEO queue. When the next Publish Content Queue schedule occurs, observe its result without manually dispatching it.
