# Project Status

Updated: 2026-08-30

## Current state

- Local validation: passing for the Publish Content Queue repair and blog initial-HTML follow-up
- Runtime release: reviewer closure `507e892f0675f6d8bbdf4b46fa70a4419327b65f` is on remote `main`
- Current follow-up: independent HIGH closed by exact category allowlisting, tag-pagination bot blocking, robots parity, and strict malformed-page normalization
- Deployment: `db:init` repair Production `6156978896`; blog-shell Production `6157245458`; reviewer closure Production `6157310775`
- Exact-SHA automation: CI `33260795865` and Hosting Cost Guard `33260795870` succeeded
- Manual production writes/workflow dispatch/content publication: not performed; automatic outbox run `33260869070` selected 0 rows

## Current validation target

- ESLint
- application and script TypeScript checks
- focused unit tests
- Next.js production build
- package/workflow command contract
- production dependency audit
- raw response HTML regression and full desktop/mobile browser suite

## Remaining external observation

- The next naturally scheduled Publish Content Queue run after release
- Current production Turso queue state remains credential-gated
- GA4, Search Console, Naver Search Advisor, and PageSpeed field measurements

Use [PROJECT_STATE.md](PROJECT_STATE.md) and `.goal-harness/` as the canonical detailed record. Older files under `docs/reports` are historical snapshots.
