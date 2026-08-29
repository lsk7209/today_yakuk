# PROJECT_STATE

## 2026-08-30 Publish queue and blog HTML-shell repair

- GitHub-first inspection used remote `main`; the user's dirty, diverged `D:\web\todaypharm` checkout was not modified. The isolated clone released the runtime repair through `507e892f0675f6d8bbdf4b46fa70a4419327b65f`.
- Scheduled Publish Content Queue run `33256826221` and multiple earlier runs failed before publication because the workflow called a missing `npm run db:init` command.
- Added the missing package alias to the existing `scripts/init-turso-schema.mjs` implementation and a regression test that binds the workflow command to that alias.
- The first repair was released as `da8d44c`; GitHub CI run `33259114351` and Git-connected Production deployment `6156978896` succeeded for that exact SHA.
- The blog-shell follow-up was released as `e182e10`; GitHub CI `33260457513`, Hosting Cost Guard `33260457490`, and Git-connected Production deployment `6157245458` succeeded.
- The reviewer closure was released as `507e892`; GitHub CI `33260795865`, Hosting Cost Guard `33260795870`, and Git-connected Production deployment `6157310775` succeeded for that exact SHA. It keeps the literal blog shell, narrows bot pagination to exact wiki categories, blocks arbitrary tag pagination consistently in proxy and robots.txt, strictly normalizes malformed page values, and preserves the stale-script cleanup.
- Local validation passed: clean install/audit 0, unit 31/31, lint, both TypeScript checks, empty-credential fail-closed smoke, production build 57, targeted Playwright 10/10, isolated-port full Playwright 32/32, and diff check.
- Current public-data evidence is healthy: Scheduled Public Data Sync `33227743842` added 17 pharmacy rows and verified a public detail sample.
- Public raw-response verification passed on the canonical domain for Browser and Googlebot blog/page-2 requests, malformed-page normalization, and all intended bot blocks. No manual production DB/API write, workflow dispatch, content publication, Vercel CLI/API mutation, or manual deployment was performed. Push-triggered Indexing Notification Outbox run `33260869070` completed naturally with `selected=0 succeeded=0 failed=0`. The publisher must be observed only on its next natural schedule.

## Purpose

Today Yakuk 저장소의 보안·데이터 무결성·의존성·자동화·핵심 브라우저 흐름을 로컬에서 수리하고 재현 가능한 검증 상태를 유지한다.

## Current Work

- 2026-08-27: `https://github.com/lsk7209/today_yakuk`을 `D:\web\todaypharmkr`에 복제했다.
- 기준 브랜치/커밋: `main` / `82f4e44` (검토 시작 시점)
- 상태: 로컬 수정·보완 및 Level 4 검증 완료
- Git 경계: 로컬 HEAD와 `origin/main`은 모두 `82f4e4468bf8553e919fe653825381c1d65289e0`; 수정은 미커밋이며 push/deploy 없음

## Implemented

- 공개 콘텐츠를 `published`로 제한하고 관리자 업데이트를 strict Zod schema + SQL 필드 allowlist로 고정했다.
- 약국 강조 텍스트를 escape-first로 바꾸고, DB HTML은 `sanitize-html` allowlist, 동적 JSON-LD는 `<` escape serializer를 사용한다.
- HFF upsert는 source-owned 필드만 갱신하며 파생 enrichment를 보존한다.
- nearby 좌표/radius 검증 및 위도별 경도 bounding box를 적용했다.
- 정부 API URL을 HTTPS로 바꾸고 HFF/medicine/enrichment 부분 실패가 workflow를 실패시키도록 전파한다.
- workflow dispatch 입력을 env로 전달하고 숫자/enum allowlist로 검증하며 generation/publishing cadence를 문서와 일치시켰다.
- Next.js 16.3.3, ESLint flat config, async route props, async sitemap id, proxy convention 및 Node OG runtime으로 마이그레이션했다.
- Playwright navigation/locator/hydration 문제를 고치고 운영 DB·외부 브라우저 네트워크를 격리했다.
- 취약하고 사용되지 않던 `xlsx`와 `scripts/enrich-from-hff-excel.ts`를 제거했다. 삭제 파일은 Git 기준 커밋에서 복구 가능하다.

## Validation

- `npm ci`: 통과, 잠금파일 재현 및 audit 0
- `npm run lint`: 통과
- `npx tsc --noEmit`: 통과
- `npx tsc --noEmit --project tsconfig.sync.json`: 통과
- `npm run test:unit`: 11/11 통과
- `npm audit --json`: 취약점 0
- workflow YAML parse와 `git diff --check`: 통과
- `npm run build`: Next.js 16.3.3 프로덕션 빌드 통과, 56 route/static outputs
- 격리 Playwright: Desktop/Mobile 22/22 통과
- Terra 테스트 리뷰: BLOCKER/HIGH 0; route test·격리 권고 반영
- Sol 보안/신뢰성 리뷰: 수정 후 BLOCKER/HIGH 0

## Remaining Risks

- 관리자 로그인 rate limit은 프로세스 로컬이며 신뢰 프록시 IP 계약이 필요하다.
- nearby는 bounding-box 후보를 정렬 없이 400개로 제한해 초밀집 지역에서 가까운 약국을 누락할 수 있다.
- publish workflow는 concurrency/원자적 claim 및 IndexNow/GSC 실패 재시도 상태가 없다.
- Turso 환경변수 누락 시 dummy client가 빈 성공 응답을 반환해 운영 설정 오류를 가릴 수 있다.
- ESLint 9.39.5는 upstream 지원 종료 상태다. ESLint 10은 현재 Next 16.3.3 번들 React 플러그인과 실제 호환되지 않았고 audit은 0이다.
- 운영 DB/API/콘텐츠 발행 및 실제 배포 동작은 검증하지 않았다.

## Next Actions

1. 로컬 diff를 검토하고 요청 시 명시적 allowlist로 commit/push한다. Vercel 배포는 별도 허용 전 금지다.
2. 다음 보안 주기에는 공유 rate limiter와 운영 Turso fail-fast 정책을 결정한다.
3. nearby 후보 SQL 정렬과 publish 원자적 claim/통지 재시도를 설계한다.
4. 운영 데이터/API 검증은 별도 승인과 test-safe 계정/환경에서 수행한다.

## 2026-08-27 Data-to-content pass

### Outcome

- 읽기 전용 공개 sitemap과 GitHub Actions 로그를 대조해 cutoff 이후 site-record 생성분을 건강기능식품 989개, 의약품 25개로 확인했다.
- 약국 원천 응답은 직전 25,291건에서 최신 25,295건으로 4건 늘었지만 전체 sync의 timestamp 특성상 신규 개업 4곳으로 해석하지 않았다.
- auto-enrichment run `33027321710`이 `nutrition_data` 누락 후보 15개를 골라 15개 모두 port 80 timeout으로 실패하고도 원격 기준에서는 성공 종료한 사실을 기록했다. 로컬 기존 수리는 HTTPS와 nonzero exit를 사용하지만 아직 원격에 반영되지 않았다.
- 근거와 경계를 `content/data-audits/2026-08-27.json`에 고정하고, 재현 가능한 `audit:data-content`와 `audit:content-duplicates` 명령을 추가했다.
- 새 데이터 설명 글을 `/blog/data-update-2026-08`에 로컬 초안으로 만들었다. 실제 발행 시각이 없으므로 `noindex,nofollow`이며 blog 목록·sitemap에서 제외했다.
- 건강기능식품/의약품 상세의 약사 검증·식약처 인증·첨가물 부재/안전 단정과 즉시 구매 암시를 공공데이터 범위에 맞게 낮췄다.
- `skin-trouble-first-aid-kit`의 존재하지 않는 내부 링크 2개를 실제 route로 교체했다.

### Coverage and validation

- 중복: 다른 정적 blog route 22개, local campaign 306행, public blog sitemap slug 712개, rendered blog index 60페이지에서 target title/slug match 0.
- `npm run lint`: pass.
- `npx tsc --noEmit`: pass.
- `npx tsc --noEmit --project tsconfig.sync.json`: pass.
- `npm run test:unit`: 13/13 pass.
- `npm run build`: pass, 57 route/static outputs.
- isolated Playwright: 24/24 pass across Desktop Chrome and Mobile Chrome; new draft counts, caveat, noindex and six sample links included.
- Terra test reviewer와 Sol reliability reviewer의 모든 HIGH/MEDIUM 지적을 수리했다. 최종 BLOCKER/HIGH는 0.

### Boundaries and next actions

- 운영 DB 직접 current snapshot은 자격증명이 없어 미검증이다. 로그 pre-sync count와 public sitemap count는 versioned manifest에서 별도 필드로 유지한다.
- 외부 DB/API write, workflow dispatch, live publication, commit, push, deploy, Vercel 작업은 없었다.
- 게시가 승인되면 manifest를 재생성하고 실제 `publishedAt`을 기록한 뒤 noindex를 해제하고 blog registry/sitemap에 추가해야 한다.
- GitHub 반영 요청이 오면 사용자 변경을 보존한 명시적 allowlist로 commit/push까지만 진행한다.

## 2026-08-28 Search acquisition and conversion optimization

### Outcome

- 검색 유입 목표를 `유효한 약국/지역/정보 페이지 발견성`으로, 핵심 전환을 `전화 또는 길찾기 의도`로 고정하고 로컬 전체 흐름을 개선했다.
- 요청 시각 lastmod와 빌드 시점 DB 동결을 없앤 runtime sitemap index/child routes, 공유 약국 indexability 규칙, 지역 alias/pagination canonical, 잘못된 wiki 상태 제어를 반영했다.
- 실제 검색 URL과 맞지 않고 지원 종료된 SearchAction을 제거하고 사이트명/canonical/Organization 정체성은 유지했다. 등록 영업시간을 현장 실시간 상태처럼 보이게 하던 문구도 방문 전 전화 확인 중심으로 정정했다.
- 홈 결과의 유효 전화번호에 직접 연락 CTA를 추가하고, 상세/근처/콘텐츠에서 전화·길찾기·가까운 약국 찾기 흐름을 연결했다.
- 검색/결과/상세/contact/directions/content CTA를 원문 검색어·전화번호·좌표 없이 측정하도록 typed analytics contract를 만들었다. analytics intake에는 strict JSON, exact same-origin, path/referrer normalization과 process-local rate limit을 적용했다.
- 소아 발열 및 숙취 글에서 절차형 HowTo와 위험한 자가 교차복용/대체 진통제 권고를 제거하고 공식 확인 경계를 보존했다.
- `entity_present: true`; `neo: evidence_missing`. GEO 준비도 내부 기준선은 60/100 추정치이며 순위 보장이 아니다.

### Validation

- `npm run lint`: pass.
- `npx tsc --noEmit`: pass.
- `npx tsc --noEmit --project tsconfig.sync.json`: pass.
- `npm run test:unit`: 20/20 pass.
- `npm run build`: pass, Next.js 16.3.3, 55 static outputs; runtime sitemap routes are dynamic.
- sitemap route smoke: index/static 200, invalid id 404, DB 없는 로컬의 data child 404 fail-closed.
- analytics route smoke: cross-origin 403, same-origin valid body with no DB 503 fail-closed.
- isolated Playwright: Desktop/Mobile 28/28 pass, including conversion event payloads and dev third-party-script isolation.
- 390/768/1366 viewport: horizontal overflow 0, console error/warning 0.
- `git diff --check`: pass. Final technical SEO and test reviewers BLOCKER/HIGH 0.

### Boundaries and next actions

- 현재 라이브는 이 로컬 변경 전 상태다. 라이브 지역 RSC 오류와 DB-backed sitemap은 향후 별도 승인된 Git push/배포 뒤에만 해결 여부를 판정할 수 있다.
- PageSpeed public API는 429 quota exhaustion으로 점수를 주지 않았고, Naver Search Advisor와 GA4 property의 실데이터/key event 설정은 확인하지 않았다.
- analytics rate limit은 process-local이므로 분산 공용 제한은 남은 MEDIUM 운영 과제다. 전환 이벤트는 실제 통화·방문·구매가 아닌 의도 신호다.
- 배포가 별도 승인될 경우 2026-09-11에 대표 질의 노출/클릭/CTR, 지역 페이지 오류, DB sitemap, contact/directions intent를 재측정한다.
- 외부 DB/API write, commit, push, deployment, Vercel 작업은 수행하지 않았다. GitHub 반영 요청 시 사용자 변경을 보존한 allowlist commit/push까지만 진행한다.

## 2026-08-28 API delta/content follow-up

### Outcome

- 이전 manifest 관측시각 `2026-08-27T12:43:45.502Z` 이후 공개 sitemap 82개 child를 다시 확인했다. pharmacies 25,971, supplements 48,016, medicines 4,952, blog 712개 공개 경로 중 기준선 이후 delta는 모두 0이었다.
- 후속 auto-enrichment run `33079730318`은 기존 제품 15개를 처리했으나 모든 행에서 구조화 영양성분 0건을 기록했다. 신규 행과 의미 있는 보강은 0으로 해석했으며, 이를 신규 제품·성분 부재로 주장하지 않았다.
- 결과를 `content/data-audits/2026-08-28.json`에 고정했다. 신규 데이터 글은 만들지 않고 기존 `/blog/data-update-2026-08` noindex 초안에 후속 확인을 보강했다.
- 제목 `영양제 라벨 읽는 순서: 기능성·원료명·섭취량`의 검색·제목·slug 중복이 없음을 확인하고 `/blog/supplement-label-reading-guide`를 original noindex 초안으로 작성했다. 식품안전나라·식약처 표시기준, 표본 제품 3개, wiki 탐색과 가까운 약국 CTA를 연결했다.
- 이름만으로 만든 요약·영양정보를 공개 근거로 사용하지 않도록 `ai_summary` 노출을 제거하고 `foodsafetykorea:C003` 출처 표식이 있는 양수 영양성분만 상세·비교·indexability에 사용한다.
- sync/enrichment는 zero-fact 0-write, 응답/건수/제품 식별/부분 실패 nonzero, 이름 전용 job fail-closed, run-number cursor rotation을 사용한다.

### Validation

- 데이터 감사: 기준선 이후 공개 경로 delta 4종 모두 0; Actions는 읽기 전용 확인만 수행.
- 중복: 정적 route 23개와 registry, campaign 306행, 공개 sitemap 712개, 렌더링 목록 60페이지에서 target match 0.
- `npm run lint`: pass.
- `npx tsc --noEmit`: pass.
- `npx tsc --noEmit --project tsconfig.sync.json`: pass.
- `npm run test:unit`: 22/22 pass.
- `npm run build`: pass, Next.js 16.3.3, 56 generated pages.
- isolated Playwright: Desktop/Mobile 30/30 pass. 라벨 가이드 noindex, 공식 링크, 내부 링크, schema 제외와 실제 CTA analytics payload를 포함한다.
- 데스크톱·모바일 full-page 시각 확인: 모바일 viewport/scroll width 375 일치, console error/warning 0.
- `npm audit --json`: vulnerabilities 0. `git diff --check`: whitespace error 0.
- 독립 test reviewer의 MEDIUM 증거 공백을 보완했고, Sol/high 최종 신뢰성 재검토에서 material finding 없음, BLOCKER/HIGH 0.

### Boundaries and next actions

- 운영 DB 직접 snapshot과 live 정부 API 호출은 자격증명 부재로 미검증이다. legacy unmarked nutrition facts는 authoritative re-enrichment 전까지 공개 표면에서 의도적으로 숨긴다.
- no-data 상태를 DB에 영구 기록하지 않아 재시도 API 비용은 남을 수 있으나 cursor rotation으로 첫 15행 고착은 막았다.
- 두 콘텐츠 artifact는 로컬 `noindex,nofollow`이고 목록·sitemap에서 제외된다. 현재 라이브 검색 유입/전환 효과는 없으며 순위 상승도 보장하지 않는다.
- 외부 DB/API write, workflow dispatch, publication, commit, push, deployment, Vercel 작업은 수행하지 않았다.
- 다음 승인 단계는 사용자 diff 검토 후 명시적 allowlist commit/push다. 발행·데이터 재보강·Vercel 작업은 각각 별도 승인 없이는 진행하지 않는다.

## 2026-08-28 Scheduled-content follow-up

### Outcome

- 공개 블로그, GitHub Actions와 scheduler 코드를 교차 확인한 마지막 예약글은 `8월 무더위 건강 적신호! 냉방병, 식중독, 벌레 물림, 약국에서 똑똑하게 대비하세요!`이며 run `33111937934`가 `2026-09-21T12:00:00.000Z`(`2026-09-21 21:00 KST`)를 기록했다.
- 이 로그는 insert 당시 `pending` 예약을 증명한다. 현재 운영 DB row 상태는 자격증명 부재로 직접 확인하지 않았고, manifest에도 이를 미확인으로 고정했다.
- 다음 코드상 후보 슬롯은 `2026-09-22 09:00 KST`지만 실제 예약하지 않았다.
- 최종 리뷰에서 manifest 문자열만 검증하던 공백을 발견해 실제 `getNextSlot()` 경계 테스트를 추가했다. 그 과정에서 기존 +1분 방식이 05:59:59.999와 23:59:59.999 직후 슬롯을 건너뛰는 결함을 찾아 strict candidate 비교로 수리했다.
- 검토되지 않은 외부 생성 본문이 하루 두 번 자동으로 추가되지 않도록 `.github/workflows/generate-blog.yml`의 cron만 제거하고 수동 dispatch와 기존 pending 발행 workflow는 유지했다. 이 변경은 push 전까지 원격 효과가 없다.
- 기존 정적 24+registry, campaign 306, 공개 sitemap 712, 렌더링 713에서 제목/slug 중복 0을 확인한 뒤 `영양제 첨가물 표시 읽는 법: 원료·기능성분과 구분하기`를 Codex가 직접 로컬 noindex 초안으로 작성했다.
- 초안은 식품안전나라, 국가법령정보센터 표시기준, 식약처 첨가물 고시전문을 연결하고 `지정 키워드 미확인`·`자료 없음`이 성분 부재나 안전성 판정이 아니라는 경계를 설명한다. 제품 상세 `AdditiveSignal`에서도 이 해석 가이드로 연결한다.

### Validation

- schedule manifest JSON parse: pass; generate-blog workflow YAML parse: pass.
- `npm run lint`: pass.
- `npx tsc --noEmit`: pass.
- `npx tsc --noEmit --project tsconfig.sync.json`: pass.
- `npm run test:unit`: 25/25 pass; scheduler 00/06/12 경계와 AdditiveSignal true/false/자료없음 server render 포함.
- `npm run build`: pass, Next.js 16.3.3, 57 generated pages.
- `npx playwright test --reporter=line`: Desktop/Mobile 32/32 pass; noindex, claim boundary, official/internal links, Breadcrumb-only schema and nearby analytics payload 포함.
- 독립 test reviewer의 MEDIUM 2건을 수리한 뒤 재검토 결과 잔여 BLOCKER/HIGH/MEDIUM 0.
- `git diff --check`: pass. local HEAD와 `origin/main`은 모두 `82f4e4468bf8553e919fe653825381c1d65289e0`; commit/push 없음.

### Boundaries and next actions

- 운영 DB/API 쓰기, workflow dispatch, 실제 예약·발행, commit, push, deployment, Vercel 작업은 수행하지 않았다.
- 이미 pending인 글은 기존 publish workflow가 계속 처리한다. 특히 8월 계절성 제목이 9월 21일에 예약된 상태는 별도 editorial/DB 운영 판단이 필요하다.
- 신규 가이드는 현재 라이브에 없고 검색 유입·전환 효과도 아직 없다. 발행하려면 최신 중복/공식 원문 재검토, 실제 publication timestamp, noindex 해제, blog registry/sitemap 반영이 필요하다.
- 다음 Git 단계는 사용자의 별도 승인 후 명시적 allowlist commit/push까지만 진행하며 Vercel은 다루지 않는다.

## 2026-08-28 GitHub publication contract

- 사용자가 `깃배포해`로 GitHub 반영을 승인했다. 범위는 현재 `origin/main` 기준 SHA `82f4e4468bf8553e919fe653825381c1d65289e0` 위에 누적된 검증 완료 소스·워크플로·콘텐츠·테스트·하네스 변경이다.
- 독립 범위 감사에서 변경 122경로(수정 80, 삭제 4, 신규 38)가 모두 이 문서와 `.goal-harness/CHANGELOG.md`의 작업 범위와 일치했고, 무관 파일·비밀값·DB·로그·대형 바이너리는 없었다.
- push 직전 `npm run test:unit` 25/25, lint, production dependency audit 0, 전체 workflow YAML parse를 다시 통과했다. 앞서 같은 source revision의 양쪽 typecheck, build 57, Playwright 32/32가 통과했다.
- release는 `git add -A`가 아니라 정확한 122경로 allowlist를 stage하고 cached diff를 검증한 단일 commit으로 `origin/main`에 fast-forward push한다.
- GitHub push 이후 실제 commit SHA는 `git ls-remote origin refs/heads/main`으로 검증해 최종 인계에 기록한다. Vercel, 운영 DB/API, workflow dispatch와 실제 콘텐츠 예약·발행은 이 release 범위가 아니다.
## 2026-08-28 Completion follow-up

### Outcome

- Confirmed the prior GitHub release: local and remote `main` were `000375cd2cc19c4abe0b11331310869eb48c56b9` before this follow-up.
- Database-writing public-data jobs now require Turso credentials; schema initialization exits nonzero on any non-ignored failure.
- Queue publication uses a concurrency group and atomic pending-state claim; only claimed rows proceed to indexing.
- Nearby preselection orders candidates before `LIMIT 400`; tag pages share supplement indexability rules.
- Added standard test commands, GitHub CI, current README/status/docs map, blank admin-password example, and least-privilege indexing guidance.

### Validation

- lint, application typecheck, script typecheck: pass.
- unit: 27/27 pass, including executable empty-env, double-claim, and in-memory SQL predicate checks.
- build: pass, 57 generated pages.
- Playwright: 32/32 desktop/mobile pass.
- production dependency audit: vulnerabilities 0.
- workflow YAML parse, schema syntax, and `git diff --check`: pass.

### Public data follow-up

- Read-only sitemap audit at `2026-08-28T01:03:12.062Z` using cutoff `2026-08-27T22:31:26.243Z` found pharmacy 0, supplement 0, and medicine 0 entries since cutoff.
- One blog sitemap entry changed: `/blog/jangmachul-gompangi-jilhan-yebang-yakguk`. This is a content publication/update signal, not new public API data.
- No new data-based article was generated because there was no pharmacy, supplement, or medicine delta.

### Boundaries

- This follow-up is local and uncommitted. No Git push, deployment, Vercel action, production DB write, workflow dispatch, queue publication, or live content publication was performed.
- Production Turso rows, live post-release DB-backed routes, and analytics/search-console field data remain separate credentialed verification tasks.
## 2026-08-28 Supabase retirement

- Deleted GitHub Actions secrets `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`; verification list returned none.
- Removed the unused `@supabase/supabase-js` dependency, legacy migration script, unused Supabase error helper, Supabase image-host allowlist, and stale runtime labels/comments.
- Preserved historical docs with legacy warnings; current runtime and workflows use Turso.
- Validation: lint, both typechecks, unit 27/27, and production build 57 passed; dependency audit remains 0.
- Boundary: Vercel environment-variable names were not inspected because the local checkout is not linked; no Vercel setting was changed. Local code changes are uncommitted/unpushed.

## 2026-08-28 automated ingestion reliability implementation

- Added durable per-source sync history with before/after counts, duration, error, and public verification status.
- Pharmacy collection rejects HTTP-200 error envelopes, malformed bodies, invalid totals, incomplete pagination, and records missing required identifiers.
- A six-hour watchdog catches stale verified sources; freshness requires a successful public sitemap/detail sample match.
- IndexNow notifications use a durable retry outbox. Publish claims return to pending if enqueue fails, and publishing initializes the schema first.
- Supabase Actions secrets were deleted earlier. The unused runtime remnants, obsolete operator setup guides, and `supabase/` SQL were removed; Turso remains the runtime database.
- Review: two Luna/max read-only lanes and one Sol/high reliability gate; BLOCKER 0 and all HIGH findings repaired.
- Boundary: no production workflow dispatch, DB mutation job, publication, Vercel action, or deployment was performed. GitHub push and CI verification are the remaining authorized release steps.
