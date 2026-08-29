# Current Handoff

Updated: 2026-08-29 23:59 KST

## User goal

Audit and improve the managed SEO fleet, using the latest GitHub `main` as the source of truth for Todaypharm and preserving the user's dirty original checkout.

## Exact current state

- Isolated release clone: `D:\web\seo-worktrees\todaypharm-publish-pipeline-20260829`
- Base branch/SHA: `main` at `8a9b8926b2950b1eb7f4c856151f651152c82a63`, equal to `origin/main` before this repair.
- Reproduced production automation defect: scheduled Publish Content Queue run `33256826221` failed before publication because `.github/workflows/publish-content.yml` called the missing `npm run db:init` script.
- The original checkout `D:\web\todaypharm` is diverged and dirty; it has not been modified by this repair.

## Completed work

- Added `db:init` to `package.json`, mapped to the existing fail-closed `scripts/init-turso-schema.mjs` implementation.
- Added a static regression contract proving that the workflow command and package script remain connected.
- Confirmed the latest scheduled public-data sync succeeded and added 17 pharmacy rows (`26006 -> 26023`) with public detail verification.
- Confirmed this repair does not need a new data-content article: the confirmed delta is operational pharmacy data, while Search Console still reports zero impressions and requires a separate indexing investigation before broad content generation.

## Changed files

- `package.json`
- `tests/unit/remediation.test.ts`
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
- `git diff --check`: pass; only Windows line-ending notices.

## Side effects and rollback

- Local dependencies/build output were created in the isolated clone only and are ignored by Git.
- No production DB/API write, content publication, workflow dispatch, Vercel CLI/API mutation, or manual deployment was performed.
- After release, rollback is a normal revert of the repair commit; do not reset or overwrite the dirty original checkout.

## Blockers and risks

- The fix cannot be proven against production credentials without running a DB-writing publication workflow. Do not dispatch it manually under this scope; use the next natural scheduled run as operational proof.
- GSC reports 0 impressions while 31,591 URLs are submitted. Treat this as a separate indexing/coverage gate, not proof that the content is poor.
- `generate:images` currently points to a missing script. It is unrelated to the failing publish workflow and remains a separate package-contract audit item.

## Single next step

Commit and push only this coherent repair set, verify the pushed SHA through GitHub CI and the Git-connected production deployment, then record the next natural Publish Content Queue result without manually dispatching it.
