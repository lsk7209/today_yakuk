# Project Status

Updated: 2026-10-15

## Current state

- AdSense readiness pass is on local branch `fix/adsense-readiness-20261015` (worktree `E:\web\_worktrees\todaypharm\adsense-readiness`, base `origin/main` `85723ef`). It is uncommitted, not pushed, and not deployed.
- Done in code: pharmacy report v2 (no fabricated defaults; stored v1 reports ignored), single publisher-ID source with disabled/verification/serving states, DB failure vs absence split (`DataReadError`, sitemap 503), robots and sitemap fixes, privacy copy aligned with actual handling.
- Report, URL policy table, content action list, QA table, deploy checklist: `docs/site-quality/ADSENSE_READINESS_2026-10-15.md`.
- Blocked on the user: new publisher ID and slots, ads.txt decision, production verification, medical-claim review, push/deploy approval.
- Soft-404 fixed by removing 3 loading.tsx (root, pharmacy/[id], [province]/[city]); lint/build/tests pass. Not run: Playwright, production checks.
- Manual production writes/workflow dispatch/content publication/Vercel actions: not performed.

## Previous state (2026-10-08)

- Nearby/pharmacy-sync remediation (`ae12bfd`) and security dependency upgrade (`next` 16.4.0) are on `origin/main`.
- Public sitemap audit (`--since=2026-09-30`) confirmed 25 new medicine records (`2026-10-04`).

## Remaining external observation

- Current production Turso queue state remains credential-gated
- GA4, Search Console, Naver Search Advisor, and PageSpeed field measurements

Use [PROJECT_STATE.md](PROJECT_STATE.md) and `.goal-harness/` as the canonical detailed record. Older files under `docs/reports` are historical snapshots.
