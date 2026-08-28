# TESTS

## Required Checks

- Clean install: `npm ci`
- Lint: `npm run lint`
- Application typecheck: `npx tsc --noEmit`
- Script typecheck: `npx tsc --noEmit --project tsconfig.sync.json`
- Focused regressions: `npm run test:unit`
- Dependency audit: `npm audit --json`
- Build: `npm run build`
- User flows: set a free local `PORT` and matching `PLAYWRIGHT_BASE_URL`, then run `npx playwright test --reporter=line`
- Workflow syntax: parse every `.github/workflows/*.yml`

## Error And Edge Cases

- malformed/empty/unknown admin PUT bodies return 400 without DB mutation
- blank/out-of-range nearby coordinates and radius return 400
- pending-only pharmacy content remains private
- entity-obfuscated HTML URLs and JSON-LD script-breakout strings are neutralized
- failed or partial public-data ingestion returns a nonzero exit status
- E2E never uses Turso credentials and blocks non-local browser requests

## User Scenario Tests

- desktop/mobile home render and header navigation
- desktop/mobile wiki render, category links/filter and search shell
- desktop/mobile blog list and footer links

## Completion Checklist

- [x] Available checks have been run or marked N/A with reasons.
- [x] Failed checks were repaired and rerun.
- [x] Acceptance criteria have matching evidence.

## 2026-08-28 Search/CRO verification

- `npm run lint`: pass.
- `npx tsc --noEmit`: pass.
- `npx tsc --noEmit --project tsconfig.sync.json`: pass.
- `npm run test:unit`: 20/20 pass, including analytics privacy, phone validation, sitemap freshness/indexability, medical schema and crawl-control contracts.
- `npm run build`: pass on Next.js 16.3.3; 55 static outputs; `/sitemap-index.xml` and `/sitemap/[id]` remain dynamic (`ƒ`).
- Sitemap production smoke: index/static 200, invalid/data-without-DB child 404; static sitemap has 54 URLs, meaningful template lastmod and the Seoul region URL.
- Analytics route smoke: cross-origin 403; same-origin valid JSON with no DB 503 fail-closed.
- `npx playwright test --reporter=line`: 28/28 pass across Desktop Chrome and Mobile Chrome, including contact/directions/content events, sensitive-value exclusion and development third-party-script absence.
- 390/768/1366 visual checks: document width equals viewport, no horizontal overflow, browser console errors/warnings 0.
- `git diff --check`: pass; only existing line-ending conversion warnings were emitted.
- Git boundary: local HEAD and `origin/main` both `82f4e4468bf8553e919fe653825381c1d65289e0`; no commit, push or deployment.

## 2026-08-28 API delta/content planned checks

- refresh public sitemap observation with explicit cutoff and bounded same-origin fetches
- inspect latest relevant GitHub Actions logs without dispatching workflows
- run full title/slug coverage and manually compare search intent against related articles
- verify source/date/claim/indexing contracts in unit tests
- run lint, both typechecks, focused unit, production build and desktop/mobile draft E2E
- confirm no external DB/API write, publication, commit, push, deployment or Vercel action

## 2026-08-28 API delta/content final verification

- `npm run audit:data-content -- --since=2026-08-27T12:43:45.502Z --types=pharmacies,supplements,medicines,blog --candidate-limit=10 --json`: pass; 82개 sitemap child에서 기준선 이후 4종 delta가 모두 0.
- GitHub Actions read-only inspection: run `33079730318`은 기존 15행을 처리했으나 모든 행의 structured nutrition fact가 0이었고 신규 행·의미 있는 보강은 0. workflow dispatch 없음.
- `npm run audit:content-duplicates -- --slug=supplement-label-reading-guide --title="영양제 라벨 읽는 순서: 기능성·원료명·섭취량" --delay-ms=100`: pass; 정적 route/registry, campaign 306행, 공개 712개, 목록 60페이지에서 제외 대상 match 0.
- `npm run lint`: pass.
- `npx tsc --noEmit`: pass.
- `npx tsc --noEmit --project tsconfig.sync.json`: pass.
- `npm run test:unit`: 22/22 pass. C003 provenance 필터, 실제 in-memory sitemap SQL, zero-fact 0-write, cursor rotation, 중단된 이름 추론 스크립트와 sync failure 계약을 포함한다.
- `npm run build`: pass on Next.js 16.3.3; 56 generated pages; `/blog/supplement-label-reading-guide`는 정적 noindex 초안이고 sitemap routes는 dynamic.
- 첫 전체 E2E는 analytics hydration listener 준비 전 클릭 경합을 드러냈다. tracker readiness 표식을 추가하고 테스트가 이를 기다리도록 수리한 뒤 `npx playwright test --reporter=line`: 30/30 desktop/mobile pass.
- Playwright CLI visual check: 데스크톱·375px 모바일 full-page screenshot, 모바일 viewport/scroll width 375 일치, console error/warning 0.
- `npm audit --json`: vulnerabilities 0.
- `git diff --check`: whitespace error 0; 기존 Windows line-ending 안내만 출력.
- 독립 test review의 MEDIUM 항목을 회귀 테스트와 문서로 보완하고, Sol/high 최종 재검토에서 BLOCKER/HIGH 0을 확인했다.
- 외부 DB/API write, publication, workflow dispatch, commit, push, deployment, Vercel action: 0.

## 2026-08-28 Scheduled-content final verification

- GitHub Actions/public read-only audit: run `33111937934` logged the title and `publish_at=2026-09-21T12:00:00.000Z`; KST conversion is `2026-09-21 21:00`. No workflow was dispatched.
- Duplicate audit: `supplement-additives-label-guide` target match 0 across 24 static route files plus registry, 306 campaign entries, 712 public sitemap entries and 713 rendered published entries.
- JSON manifest parse: pass with PowerShell `ConvertFrom-Json`.
- workflow YAML parse: pass with `js-yaml`; `workflow_dispatch` remains and top-level `schedule` is absent.
- `npm run lint`: pass.
- `npx tsc --noEmit`: pass.
- `npx tsc --noEmit --project tsconfig.sync.json`: pass.
- `npm run test:unit`: 25/25 pass, including actual `getNextSlot()` boundary calls, AdditiveSignal true/false/unavailable server renders, schedule evidence, next-slot non-reservation, workflow and noindex/unlisted source contracts.
- Reviewer-driven repair: the first new render assertion failed because an accessibility label made the raw source count 5; the assertion was narrowed to rendered text nodes and the full unit suite then passed.
- `npm run build`: pass on Next.js 16.3.3; 57 generated pages including the static noindex draft.
- `npx playwright test --reporter=line`: 32/32 pass across Desktop Chrome and Mobile Chrome; robots, signal boundary, official/internal links, schema exclusion and nearby analytics payload covered.
- External DB/API write, workflow dispatch, reservation, publication, commit, push, deployment or Vercel action: 0.
