# Project Status

Updated: 2026-10-23

## Current state

- 2026-10-23: P0~P2 개선 커밋·push 완료(브랜치 `design/city-signal-20261012`, 드래프트 PR #7). 상세·처리표는 `docs/reports/improvement-2026-10-23.md`.
  - 검증: `test:unit` exit 0, Playwright e2e 27 passed(Edge 채널, `PLAYWRIGHT_CHANNEL=msedge`), 390×844 로컬 캡처 확인. 운영 DB 읽기 전용 감사: 49,036개 중 624개 영향(쓰기 없음).
  - 대기: Vercel 프리뷰 `Deployment was blocked`(팀 권한 확인 필요), 건강 콘텐츠 30개·토요일 요금 안내문 약사 검토, 영양성분 소스 결정(`sync:supplements`는 현재 성분 미생성), 운영 DB backfill·배포·Search Console 삭제 요청은 별도 승인.

- Local working tree has six modified, uncommitted files implementing a nearby/pharmacy-sync bug-fix pass on top of remote `main` `cf635d7`:
  `scripts/sync-pharmacies.ts`, `src/app/api/nearby/route.ts`, `src/app/nearby/NearbyClient.tsx`, `src/app/page.tsx`, `src/lib/data/pharmacies.ts`, `tests/unit/remediation.test.ts`
- Fixes: coordinate/time-field parsing no longer collapses real `0` values, sync-time province storage now matches the read-path alias map, the nearby `open=true` filter is applied before the result is truncated to `limit`, a request-generation guard prevents stale geolocation/fetch responses from overwriting newer state on the home and nearby pages, a too-short search term shows a validation message instead of an unrequested GPS prompt, and a pharmacy-lookup DB failure now propagates instead of being reported as "not found".
- Local validation: full pass — lint, `tsc --noEmit` (both app and `tsconfig.sync.json`), unit tests (42/42 including new TP-02–TP-06 regressions), and production build (58 routes).
- Runtime release: still `cf635d7` (`Reduce optional scheduled work and preserve cost monitoring`) on remote `main`; this session's fixes are not yet committed or pushed.
- Manual production writes/workflow dispatch/content publication/Vercel actions: not performed.

## Current validation target

- ESLint
- application and script TypeScript checks (`tsc --noEmit`, `tsconfig.sync.json`)
- focused unit tests (`npm run test:unit`)
- Next.js production build
- (optional, not yet run this session) full Playwright suite before push

## Remaining external observation

- Whether to commit and push the validated nearby/pharmacy diff (pending user decision)
- Current production Turso queue state remains credential-gated
- GA4, Search Console, Naver Search Advisor, and PageSpeed field measurements

Use [PROJECT_STATE.md](PROJECT_STATE.md) and `.goal-harness/` as the canonical detailed record. Older files under `docs/reports` are historical snapshots.
