# Project Status

Updated: 2026-08-29

## Current state

- Local validation: passing for the Publish Content Queue repair
- GitHub baseline: `main` at `8a9b8926b2950b1eb7f4c856151f651152c82a63`
- Current follow-up: `db:init` workflow/package contract repaired in an isolated clone and awaiting an allowlisted commit/push
- Deployment: not yet performed for this repair
- Production DB writes, workflow dispatch, and content publication: not performed in this follow-up

## Current validation target

- ESLint
- application and script TypeScript checks
- focused unit tests
- Next.js production build
- package/workflow command contract
- production dependency audit

## Remaining external verification

- The next naturally scheduled Publish Content Queue run after release
- Current production Turso queue state remains credential-gated
- GA4, Search Console, Naver Search Advisor, and PageSpeed field measurements

Use [PROJECT_STATE.md](PROJECT_STATE.md) and `.goal-harness/` as the canonical detailed record. Older files under `docs/reports` are historical snapshots.
