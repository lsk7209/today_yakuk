# Project Status

Updated: 2026-08-30

## Current state

- Local validation: passing for the Publish Content Queue repair and blog initial-HTML follow-up
- GitHub baseline: local `HEAD` and fetched `origin/main` at released SHA `da8d44c732936562724ea249863ca3c958868c96`
- Current follow-up: blog H1/description/curated links moved outside the DB wait; crawler pagination allowlist reconciled with robots.txt; stale deleted-script alias removed; awaiting an allowlisted commit/push
- Deployment: first repair verified in Production deployment `6156978896`; current follow-up not yet released
- Production DB writes, workflow dispatch, and content publication: not performed in this follow-up

## Current validation target

- ESLint
- application and script TypeScript checks
- focused unit tests
- Next.js production build
- package/workflow command contract
- production dependency audit
- raw response HTML regression and full desktop/mobile browser suite

## Remaining external verification

- The next naturally scheduled Publish Content Queue run after release
- Current production Turso queue state remains credential-gated
- GA4, Search Console, Naver Search Advisor, and PageSpeed field measurements

Use [PROJECT_STATE.md](PROJECT_STATE.md) and `.goal-harness/` as the canonical detailed record. Older files under `docs/reports` are historical snapshots.
