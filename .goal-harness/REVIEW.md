# REVIEW

## Overall verdict

The local remediation is complete at validation Level 4. Clean install, lint, app/script typechecks, 11 focused checks, full audit 0, production build and isolated Playwright 22/22 all pass. Terra and Sol independent reviews report BLOCKER/HIGH 0. No commit, push, deployment or production data operation was performed.

## Baseline prioritized findings (historical)

1. **HIGH** - public pharmacy pages fetch both `published` and `pending` content (`src/lib/data/content.ts:68-84`, `src/app/pharmacy/[id]/page.tsx:163-166`). Draft/AI-pending material must be excluded from public getters.
2. **HIGH** - admin queue updates build SQL column assignments from raw request keys (`src/app/api/admin/queue/[id]/route.ts:10-19`, `src/lib/data/content.ts:159-185`). Validate the body and whitelist updateable columns.
3. **HIGH** - upgrade `fast-xml-parser` before relying on scheduled public XML ingestion (`package.json`, `scripts/sync-pharmacies.ts:3,110-116`).
4. **HIGH** - remove the stored-XSS path in pharmacy detail highlighting: DB/generated strings are composed into HTML without escaping (`src/app/pharmacy/[id]/page.tsx:376-388,415-424,626-648,689-702`).
5. **HIGH** - the HFF sync overwrites derived enrichment columns such as summary/tags on every import (`scripts/fetch-hff-data.ts:70-80`). Preserve derived columns unless explicitly rebuilding them.
6. **MEDIUM/HIGH** - validate and bound nearby radius and compute longitude delta by latitude (`src/app/api/nearby/route.ts:13-17,44-65`). Current logic can omit valid east/west results and accept invalid values.
7. **MEDIUM** - repair and stabilize the E2E suite (`tests/e2e/home.spec.ts:26-44`, `tests/e2e/wiki.spec.ts:18`); current evidence is 17 pass/5 fail.
8. **MEDIUM** - harden login rate limiting beyond an in-memory Map and untrusted forwarded header identity (`src/app/api/admin/login/route.ts:5-6,54-80`).
9. **MEDIUM** - reconcile workflow behavior with comments/docs; `publish-content.yml:12` runs hourly, generation remains scheduled despite its stop comment, and single-pharmacy workflow masks command failures with `|| true`.
10. **MEDIUM** - sync only upserts and never deactivates missing pharmacies (`scripts/sync-pharmacies.ts:124-173`), allowing stale/closed entries to persist.
11. **LOW** - replace the generic create-next-app README and normalize remaining NUL/mojibake residue.

## Positive controls

- Admin page/API routes are protected in middleware with a verified HttpOnly JWT cookie.
- No concrete secret was found tracked; `.env.example` contains placeholders and warnings.
- Missing Turso credentials fail closed to empty local data rather than hitting an implicit production database.
- External production/data writes and deployment commands were not executed in this review.

## Diff Review

- The changes are scoped to confirmed security/data/workflow defects plus the dependency-supported Next.js 16 migration required to reach full audit 0.
- The unused `xlsx` dependency and its only machine-specific script were removed; the source remains recoverable from Git history.
- Next 16 breaking contracts (`params`, `searchParams`, sitemap `id`, middleware-to-proxy, ESLint flat config and Node OG runtime) were migrated and build-verified.

## Regression Risk

- Focused in-memory tests cover pending visibility, admin route rejection/DB non-mutation, HFF ownership, nearby input bounds, XML compatibility, XSS encodings and workflow contracts.
- Browser tests blank Turso credentials and block every non-local browser request, avoiding production data and third-party measurement dependencies.
- Production DB shape/data, real authenticated admin UI and live government API responses remain intentionally unverified.

## Security Risk

- Sol initially found stored HTML XSS, dynamic JSON-LD breakout, Actions command injection, HTTP key exposure and false-green public-data jobs; each was repaired and re-reviewed.
- Final Sol result: BLOCKER/HIGH 0. Residual MEDIUM items are recorded in RISKS.md.

## User Flow Check

- Playwright: 22/22 across Desktop Chrome and Mobile Chrome.
- Covered routes: home, about navigation, blog navigation/list, wiki navigation/filter shell and footer.

## Acceptance Criteria Check

- All feature, user-flow, validation and documentation criteria in ACCEPTANCE.md are pass.

## Completion Gate

- [x] Acceptance criteria are satisfied or explicitly marked N/A with reasons.
- [x] Validation evidence exists in `EVIDENCE.md`.
- [x] Failed checks are fixed or clearly documented.
- [x] Regression risks were considered.
- [x] Security and risky-operation notes were recorded when applicable.
- [x] Known limitations are stated in the final report.
- [x] It is accurate to set `STATUS.md` to `DONE`.

## Remaining Limitations

- Process-local login throttling, dense-area nearby truncation, publish claim/retry semantics and production Turso fail-fast behavior are MEDIUM follow-ups.
- Operational correctness against real production data/APIs was not exercised.

## 2026-08-27 Data-to-content independent review

- Luna/max data explorer: local DB snapshot/credentials 부재와 테이블별 날짜 의미를 확인했다. pharmacies `updated_at`은 신규 개업 근거가 아니며 supplements/medicines `created_at`만 신규 site-record 근사치로 사용할 수 있다.
- Luna/max content explorer: 정적 글 22개, guide 6개, campaign draft 306행의 반복 구조와 내부 링크 공백, supplement/medicine의 근거 없는 검증·인증·첨가물 부재 표현을 찾았다.
- Terra/medium test review: 운영 수치의 durable evidence, 정적·발행 콘텐츠 중복 범위, 비정상 200 sitemap, 여섯 표본 링크 증거에서 HIGH 1/MEDIUM 3을 제기했다. versioned manifest, 712-slug/60-page coverage, root/fetch 실패 테스트, manifest-driven links로 모두 수리했다.
- Sol/high reliability review: BLOCKER/HIGH 0. 관측 시각의 발행일 오용, sitemap과 sync의 인과 단정, redirect/content-type/body/root 경계를 MEDIUM으로 지적했다. 글을 미발행 noindex 초안으로 분리하고 인과 문구를 낮췄으며 audit fetch를 제한했다.
- Primary verification: reviewer 의견 자체를 완료 근거로 쓰지 않고 최종 파일, lint, 양쪽 typecheck, unit 13/13, build, isolated Playwright 24/24로 확인했다.

### Completion gate

- [x] public/action-log evidence is frozen in a versioned manifest.
- [x] content duplicate checks cover local static, campaign, public sitemap and rendered listings.
- [x] draft publication state and medical-claim boundaries are explicit.
- [x] independent HIGH/MEDIUM findings were repaired and regression-tested.
- [x] no external mutation, Git push or deployment occurred.

## 2026-08-28 Search/CRO independent review

- Luna/max technical and GEO lanes separated crawl/indexability/runtime sitemap work from AI-citation/entity assessment. The major technical finding was build-time sitemap data freezing; it was replaced with runtime routes and revalidated in the production build.
- Terra/medium CRO and test lanes reviewed the measurable funnel and regression proof. Initial HIGH findings covered raw analytics intake and contradictory procedural medical markup; strict same-origin normalization, rate limiting, HowTo removal and safer visible copy repaired them.
- Final test review: BLOCKER/HIGH 0. Analytics intake, pediatric/hangover content and production-only Google origin hints were explicitly rechecked.
- Final technical SEO re-review: BLOCKER/HIGH 0. Both sitemap routes are `force-dynamic`, build output marks them `ƒ`, and `/sitemap.xml` compatibility rewrite plus index/static children return 200.
- Primary verification did not treat review opinions as proof: current files, lint, both typechecks, unit 20/20, build, route smoke, responsive screenshots and Playwright 28/28 were checked directly.

### Search/CRO completion gate

- [x] Search discovery and indexability contracts are truthful and test-covered.
- [x] Direct contact/directions intent is reachable and measurable without sensitive payloads.
- [x] High-risk medical/schema regressions found in review were repaired.
- [x] Desktop/mobile and production build evidence pass.
- [x] Live, DB, GA4, PageSpeed, Naver and deployment boundaries remain explicit.
- [x] No external write, commit, push, deployment or Vercel operation occurred.

## 2026-08-28 API delta/content independent review

- Luna/max data-delta lane: 2026-08-27 기준선 이후 82개 공개 sitemap child와 Actions 실행을 분리해 확인했고, 네 데이터셋의 신규 공개 경로가 모두 0임을 보고했다.
- Luna/max content-gap lane: 약국 추천성 글을 피하고 검색 의도 중복이 낮은 `supplement-label-reading-guide` 1개를 제안했다. 주 에이전트가 전체 중복 감사와 공식 출처 경계를 직접 재검증했다.
- Terra test reviewer: 문서 상태 지연, CTA 이벤트의 정적 검증, zero-write의 정적 검증을 MEDIUM으로 지적했다. 실제 CTA payload E2E, mock executor 0-write 회귀, 하네스 동기화로 모두 보완했다.
- Sol/high reliability reviewer: 초기 HIGH는 zero-fact false-green/data-loss와 이름 추론 영양정보 공개였다. sync 실패 계약, no-write, C003 provenance, public-surface 필터, cursor rotation으로 수리했다. 최종 재검토 결과 material finding 없음, BLOCKER/HIGH 0.
- Reviewer 의견을 완료 증거로 대체하지 않았다. 최종 파일, lint, 양쪽 typecheck, unit 22/22, build 56, Playwright 30/30, 시각 확인, audit 0을 주 에이전트가 직접 검증했다.

### API delta/content completion gate

- [x] 읽기 전용 공개 데이터와 실행 근거가 versioned manifest에 고정됐다.
- [x] 변화가 0인 범위를 신규 데이터로 과장하지 않았다.
- [x] original noindex guide, 공식 출처, 내부 탐색과 CTA가 검증됐다.
- [x] 이름 추론과 출처 없는 영양정보의 공개 노출을 차단했다.
- [x] 독립 BLOCKER/HIGH를 해결하고 전체 로컬 검증을 통과했다.
- [x] 외부 쓰기, 발행, commit, push, 배포, Vercel 작업은 없었다.

## 2026-08-28 Scheduled-content independent review

- Luna/max schedule lane: GitHub Actions run, previous/next slots, latest publish run and insert/current-state distinction을 읽기 전용으로 확인했다. 운영 DB 자격증명 부재를 현재 상태 미확인으로 남겼다.
- Luna/max content-gap lane: 제품 상세의 세 첨가물 신호가 검색 사용자에게 오해될 수 있는 공백을 찾고, 기존 제목/의도와 겹치지 않는 저위험 해석 가이드를 제안했다. 주 에이전트가 공식 원문과 전체 중복 범위를 다시 확인했다.
- Terra test reviewer initial result: BLOCKER/HIGH 0, MEDIUM 2. manifest 문자열만 보던 다음 슬롯 증거와 AdditiveSignal 소스 문자열 검사를 실제 함수·server-render 행동 검증으로 바꾸도록 요구했다.
- Repair: `getNextSlot()`의 00/06/12 경계를 직접 단언했고, 이 과정에서 05:59:59.999와 23:59:59.999 다음 슬롯을 건너뛰던 실제 결함을 strict-future candidate 방식으로 수리했다. AdditiveSignal true/false/undefined도 서버 렌더링해 세 상태, 안전성 고지, guide link를 확인했다.
- Terra re-review: material finding 없음; 잔여 BLOCKER/HIGH/MEDIUM 0.
- Primary verification: 리뷰 의견을 증거로 대체하지 않고 JSON/YAML parse, lint, 양쪽 typecheck, unit 25/25, build 57, Playwright 32/32와 Git 경계를 주 에이전트가 직접 확인했다.

### Scheduled-content completion gate

- [x] 마지막 예약 이벤트의 제목·UTC/KST·run이 고정되고 현재 DB 상태와 구분됐다.
- [x] 자동 외부 본문 생성 schedule만 로컬에서 제거되고 기존 pending publish queue는 보존됐다.
- [x] 다음 후보 슬롯 계산이 실제 함수 경계 테스트로 증명됐다.
- [x] 비중복 noindex guide와 AdditiveSignal 세 상태가 claim/render/CTA 테스트를 통과했다.
- [x] 독립 리뷰 잔여 BLOCKER/HIGH/MEDIUM 0이며 전체 로컬 검증이 통과했다.
- [x] DB/API write, workflow dispatch, 예약·발행, commit, push, deployment, Vercel 작업은 없었다.
## 2026-08-28 completion follow-up review

- Scope: local reliability repairs, documentation alignment, public read-only delta check, and CI preparation.
- Resolved review findings: DB-changing scripts now require credentials and validate batch effects; executable tests cover empty-env failure, duplicate claim rejection, supplement predicate filtering, and Korean-latitude longitude scaling.
- Regression proof: lint, both typechecks, unit 27/27, build 57, and Playwright 32/32 pass.
- Security/operations: no secrets printed; no production DB write, workflow dispatch, publication, push, deployment, or Vercel operation.
- Residual boundary: search-engine notification retries need a durable outbox/schema design and production migration approval; the new CI is local until a separately authorized Git push and Actions run.
- Final reliability re-review: prior fail-closed HIGH findings resolved; BLOCKER/HIGH 0.
## 2026-08-28 automation reliability review

- Reliability reviewer: BLOCKER 0, HIGH 2, MEDIUM 3.
- Repaired HIGH: malformed pharmacy API responses now fail the sync; freshness requires a public sitemap/detail sample match recorded as `verification_status='passed'`.
- Repaired MEDIUM: outbox due-time comparison normalizes timestamps; publisher restores claims if enqueue fails; obsolete Supabase operator guides and SQL were removed.
- Remaining boundary: first production evidence will come from the natural schedule; no manual production dispatch was performed.
