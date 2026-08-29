# Project Status

Updated: 2026-08-30

## Current state

- Local validation: passing for the Publish Content Queue repair and blog initial-HTML follow-up
- GitHub baseline: local `HEAD` and fetched `origin/main` at released blog-shell SHA `e182e10be961774019ccaf710237071bf9b254cf`
- Current follow-up: independent HIGH closed locally by exact category allowlisting, tag-pagination bot blocking, robots parity, and strict malformed-page normalization; awaiting commit/push
- Deployment: `db:init` repair verified in Production `6156978896`; blog-shell follow-up verified in Production `6157245458`
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
