# PLAN

## Classification

- Size: large
- Domain Profile: general
- Risk: R3 (authentication-adjacent input handling, stored XSS, data sync ownership, dependency security)

## Remediation Phase 1

- Objective: 감사 결과를 구현 가능한 계약과 테스트로 전환한다.
- Tasks: 관련 호출자·타입·SQL·UI·workflow를 확인하고 Luna 읽기 전용 의견을 통합한다.
- Expected Files: `.goal-harness/*`, `PROJECT_STATE.md`
- Completion Criteria: 수용 기준과 수정 경계가 명시된다.
- Test Point: 현행 실패 재현 및 파일 근거 확인
- Rollback/Recovery: 코드 변경 전 기준 diff와 기존 비추적 산출물을 보존한다.

## Remediation Phase 2

- Objective: 높은 위험부터 최소 변경과 회귀 검증을 구현한다.
- Tasks: content status, admin update allowlist/schema, XSS escape, XML dependency, HFF field ownership, nearby math, E2E/workflow를 수정한다.
- Expected Files: 관련 `src/`, `scripts/`, `tests/`, `.github/workflows/`, package lock files
- Completion Criteria: 집중 검증이 통과하고 외부 상태를 변경하지 않는다.
- Test Point: 새 테스트, lint, typecheck, audit
- Rollback/Recovery: 각 변경은 파일 단위 diff로 되돌릴 수 있으며 DB migration은 하지 않는다.

## Remediation Phase 3

- Objective: 전체 검증과 역할별 독립 리뷰로 완료를 증명한다.
- Tasks: build/E2E, Terra 테스트 리뷰, Sol 보안 리뷰, finding 수리, 문서 정합화를 수행한다.
- Expected Files: `.goal-harness/REVIEW.md`, `.goal-harness/ACCEPTANCE.md`, `.goal-harness/EVIDENCE.md`, `PROJECT_STATE.md`
- Completion Criteria: 수용 기준이 pass 또는 명시적 N/A이고 BLOCKER/HIGH가 남지 않는다.
- Test Point: `git diff --check`, lint, typecheck, audit, build, E2E, 하네스 요약
- Rollback/Recovery: 원격 push/배포 없이 로컬 diff와 검증 증거만 인계한다.

## Data-to-content Phase 1

- Objective: 최신 데이터와 콘텐츠 커버리지를 안전하게 진단한다.
- Tasks: 스키마 확인, 자격증명 존재 여부 확인, SELECT-only 집계/표본, 제목·slug 중복 검사.
- Completion Criteria: 신규·미보강 여부가 날짜와 개수로 기록되고 쓰기 쿼리가 실행되지 않는다.

## Data-to-content Phase 2

- Objective: 실제 데이터 근거를 로컬 콘텐츠 작업으로 전환한다.
- Tasks: 1~3개 후보 선정, Safe GOLDIE brief, 로컬 초안/manifest 또는 보강 구현, 내부 링크 설계.
- Completion Criteria: 출처·금지 주장·검수 상태가 명시된 재현 가능한 산출물이 존재한다.

## Data-to-content Phase 3

- Objective: 콘텐츠 및 코드 품질을 검증하고 상태 문서를 동기화한다.
- Tasks: 중복·표현·링크·구조 검사, lint/typecheck/관련 테스트, 독립 리뷰, 증거 기록.
- Completion Criteria: ACCEPTANCE와 EVIDENCE가 실제 결과와 일치한다.

## Data-to-content completion

- Phase 1: complete — public/action logs, schema date semantics, enrichment failure queue and duplicate coverage recorded without writes.
- Phase 2: complete — one manifest-backed noindex draft plus supplement/medicine/additive claim repairs and two broken-link fixes implemented.
- Phase 3: complete — reviewer findings repaired; lint, both typechecks, unit 13/13, build and isolated Playwright 24/24 passed.

## Search/CRO Phase 1

- Objective: 라이브·로컬의 검색/전환 기준선과 측정 계약을 고정한다.
- Tasks: robots/sitemap/schema/metadata/렌더링 확인, 검색→결과→상세→전화·길찾기 funnel 정의, 공개 성능 진단 시도, Luna 기술 SEO와 Terra CRO 읽기 전용 리뷰 통합.
- Completion Criteria: 실제 파일·라이브 응답 근거, 개인정보를 제외한 이벤트 계약, 변경 경계가 기록된다.

## Search/CRO Phase 2

- Objective: 검색 신뢰 신호와 핵심 전환 경로를 최소 변경으로 개선한다.
- Tasks: 검증 가능한 lastmod, 지원 종료 SearchAction 제거, 정확한 운영 상태 표현, 지역/콘텐츠 내부 탐색, 공용 analytics helper와 검색/상세/전화/길찾기 CTA 계측, 모바일 tap target 보완.
- Completion Criteria: 원문 검색어·좌표·전화번호를 analytics payload로 보내지 않고, 핵심 페이지의 canonical/indexability/CTA 계약이 코드와 테스트로 증명된다.

## Search/CRO Phase 3

- Objective: 정적 계약, 앱 빌드, 모바일/데스크톱 브라우저 흐름과 역할별 리뷰를 재검증한다.
- Tasks: lint, app/script typecheck, unit, build, Playwright, 라이브와 로컬 경계 문서화, PROJECT_STATE/하네스 갱신.
- Completion Criteria: BLOCKER/HIGH가 해결되고 실패·미검증 항목이 숨김없이 남는다.

### Search/CRO execution status — 2026-08-28

- Phase 1: complete — live/local robots, sitemap, schema, metadata, region rendering and conversion baseline captured; PageSpeed 429 recorded as an external evidence boundary.
- Phase 2: complete — dynamic runtime sitemap, shared indexability rules, canonical/pagination repairs, honest copy, direct contact/directions CTAs, privacy-bounded analytics and content-to-nearby paths implemented.
- Phase 3: complete — medical/schema and analytics hardening findings repaired; lint, both typechecks, unit 20/20, build, E2E 28/28 and responsive visual checks passed; final test review BLOCKER/HIGH 0.

## API delta/content Phase 1

- Objective: 2026-08-27 스냅샷 이후 데이터 변화와 날짜 의미를 쓰기 없이 증명한다.
- Tasks: 환경/자격증명 존재 여부만 확인, 공개 sitemap 감사, GitHub Actions 실행·로그 대조, 원천 count와 site-record 날짜를 구분한다.
- Completion Criteria: 관측시각·명령·count·표본·미검증 경계가 기록되고 외부 상태 변경이 없다.

## API delta/content Phase 2

- Objective: 확인된 데이터 변화 중 검색 의도와 정보 이득이 있는 소수만 콘텐츠로 전환한다.
- Tasks: 기존 정적·campaign·공개 발행 제목/slug/의도 중복 검사, Safe GOLDIE brief, 보강 또는 noindex 초안 1~3개 직접 작성, 내부 링크와 전환 CTA 연결.
- Completion Criteria: 외부 생성 API 없이 작성되고 공식 1차 출처·금지 주장·미발행 상태가 명시된다.

## API delta/content Phase 3

- Objective: YMYL·중복·링크·렌더링·빌드 품질을 검증하고 재개 상태를 동기화한다.
- Tasks: source/claim review, duplicate audit, lint, typechecks, unit, build, focused desktop/mobile E2E, 독립 test/content review.
- Completion Criteria: 수용 기준과 실제 증거가 일치하고 BLOCKER/HIGH가 0이며 외부 mutation이 없다.

### API delta/content execution status — 2026-08-28

- Phase 1: complete — 82개 공개 sitemap child와 관련 GitHub Actions를 읽기 전용으로 확인했다. 2026-08-27 기준선 이후 pharmacies, supplements, medicines, blog의 공개 경로 증분은 모두 0이며, 후속 auto-enrichment는 기존 15행에서 구조화 영양성분 0건만 기록했다.
- Phase 2: complete — 신규 데이터 글은 만들지 않고 기존 월간 noindex 초안에 0-delta 경계를 보강했다. 제목·slug 중복 0을 확인한 뒤 공식 라벨 원문, 내부 링크, 가까운 약국 CTA를 갖춘 noindex 라벨 가이드 1개를 Codex가 직접 작성했다.
- Phase 3: complete — C003 출처 표식이 있는 영양정보만 공개하고 zero-fact DB 쓰기·이름 추론·첫 페이지 고착을 막았다. lint, 양쪽 typecheck, unit 22/22, build 56, Playwright 30/30, 데스크톱/모바일 시각 검증을 통과했으며 최종 신뢰성 리뷰 BLOCKER/HIGH는 0이다.

## Scheduled-content Phase 1

- Objective: 마지막 예약 이벤트와 현재 상태의 증거 경계를 읽기 전용으로 고정한다.
- Tasks: 공개 블로그·GitHub Actions run·scheduler slot 로직을 교차 확인하고 UTC/KST, insert 시 status, 현재 DB 미확인 경계를 기록한다.
- Completion Criteria: 제목·시각·run URL·다음 후보 슬롯이 재현 가능하고 예약 이벤트를 현재 DB 상태로 과장하지 않는다.

## Scheduled-content Phase 2

- Objective: 자동 외부 본문 생성 위험을 줄이고 다음 검색 의도 초안을 안전하게 준비한다.
- Tasks: generate-blog cron 제거와 manual dispatch 유지, 제목/slug 중복 감사, Safe GOLDIE brief, 공식 출처 기반 noindex 글과 AdditiveSignal 설명 링크 구현.
- Completion Criteria: 기존 pending 발행 큐는 그대로이고 신규 초안은 목록/sitemap 제외, 부재·안전성·효능·재고 단정을 피한다.

## Scheduled-content Phase 3

- Objective: 워크플로·콘텐츠·전환·렌더링 계약을 검증하고 인계 상태를 동기화한다.
- Tasks: JSON/YAML parse, lint, 양쪽 typecheck, unit, build, desktop/mobile E2E, 독립 test review, Git 경계 확인.
- Completion Criteria: BLOCKER/HIGH 0, 모든 로컬 검증 통과, 외부 mutation 0.

### Scheduled-content execution status — 2026-08-28

- Phase 1: complete — 마지막 생성 run `33111937934`가 `2026-09-21T12:00:00Z` 슬롯을 예약한 로그를 확인했고 KST `2026-09-21 21:00`으로 고정했다. 운영 DB 현재 상태는 자격증명 부재로 미확인이다.
- Phase 2: complete — 기존 publish queue를 보존하면서 generate-blog 자동 cron만 로컬에서 제거했다. 중복 0인 `supplement-additives-label-guide`를 Codex가 직접 noindex 초안으로 작성하고 제품 상세 신호에서 연결했다.
- Phase 3: complete — reviewer가 찾은 scheduler 실제 호출과 AdditiveSignal 3상태 렌더링 공백을 보완했고, 직전 슬롯을 건너뛰던 scheduler 경계 결함도 수리했다. JSON/YAML, lint, 양쪽 typecheck, unit 25/25, build 57, Playwright 32/32와 독립 재검토 잔여 BLOCKER/HIGH/MEDIUM 0을 확인했다.
