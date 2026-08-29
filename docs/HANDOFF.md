# Current Handoff

Updated: 2026-08-30 00:17 KST

## User goal

Audit and improve the managed SEO fleet, using the latest GitHub `main` as the source of truth for Todaypharm and preserving the user's dirty original checkout.

## Exact current state

- Isolated release clone: `D:\web\seo-worktrees\todaypharm-publish-pipeline-20260829`
- Base branch/SHA: `main` at released commit `da8d44c732936562724ea249863ca3c958868c96`, equal to fetched `origin/main` before the current follow-up.
- Reproduced production automation defect: scheduled Publish Content Queue run `33256826221` failed before publication because `.github/workflows/publish-content.yml` called the missing `npm run db:init` script.
- The original checkout `D:\web\todaypharm` is diverged and dirty; it has not been modified by this repair.
- The first repair is live: GitHub CI run `33259114351` and Git-connected Production deployment `6156978896` both succeeded for `da8d44c`.
- Current production `/blog` is 200 and has correct metadata, but its literal initial HTML has no H1 or static guide links; those elements are present only in the streamed RSC payload.
- Current production also returns 403 to Googlebot for `/blog?page=2` even though robots.txt explicitly permits `/*?page=`; local production-mode reproduction confirmed the contradiction.

## Completed work

- Added `db:init` to `package.json`, mapped to the existing fail-closed `scripts/init-turso-schema.mjs` implementation.
- Added a static regression contract proving that the workflow command and package script remain connected.
- Confirmed the latest scheduled public-data sync succeeded and added 17 pharmacy rows (`26006 -> 26023`) with public detail verification.
- Confirmed this repair does not need a new data-content article: the confirmed delta is operational pharmacy data, while Search Console still reports zero impressions and requires a separate indexing investigation before broad content generation.
- Refactored `/blog` so its authored H1, description, and curated guide links render synchronously before the Suspense boundary; DB-backed posts, count, pagination, and dynamic ItemList remain in the async child.
- Removed the stale `generate:images` package alias whose target was intentionally deleted, and added a unit contract that all package-referenced local scripts exist.
- Added a raw-response Playwright regression for literal H1 and a representative curated internal link.
- Reconciled crawler controls: bounded blog/wiki pagination and curated wiki-category states can pass, while search queries, unknown keys, APIs, duplicate parameters, malformed pages, and pages over 10,000 remain blocked for bot UAs.

## Changed files

- `package.json`
- `tests/unit/remediation.test.ts`
- `src/app/blog/page.tsx`
- `tests/e2e/wiki.spec.ts`
- `src/proxy.ts`
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
- `git diff --check`: pass; only Windows line-ending notices.

## Side effects and rollback

- Local dependencies/build output were created in the isolated clone only and are ignored by Git.
- No production DB/API write, content publication, workflow dispatch, Vercel CLI/API mutation, or manual deployment was performed.
- After release, rollback is a normal revert of the repair commit; do not reset or overwrite the dirty original checkout.

## Blockers and risks

- The fix cannot be proven against production credentials without running a DB-writing publication workflow. Do not dispatch it manually under this scope; use the next natural scheduled run as operational proof.
- GSC reports 0 impressions while 31,591 URLs are submitted. Treat this as a separate indexing/coverage gate, not proof that the content is poor.
- The route remains dynamically rendered because it still uses `searchParams` and DB data; the repair proves a useful literal HTML shell, not full static prerendering or a Core Web Vitals improvement.
- Public raw-HTML parity and metadata for `/blog` and `/blog?page=2` still require verification after the follow-up release.

## Single next step

Commit and push only the coherent blog HTML-shell/package-contract follow-up, verify exact-SHA GitHub CI and Git-connected production, then verify public raw HTML before observing the next natural Publish Content Queue result without manually dispatching it.
