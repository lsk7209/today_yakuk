# ACCEPTANCE

## Feature Criteria

| Criteria | Status | Evidence |
|---|---|---|
| 로컬 HEAD가 다운로드 시점의 origin/main과 일치한다 | pass | local/remote SHA `82f4e4468bf8553e919fe653825381c1d65289e0` |
| 프로젝트 구조와 핵심 실행 경로가 설명된다 | pass | FILEMAP.md 및 REVIEW.md |
| 주요 위험이 파일 근거와 함께 우선순위화된다 | pass | REVIEW.md 및 RISKS.md |
| 공개 약국 페이지는 pending 콘텐츠를 반환하지 않는다 | pass | pending-only fixture와 published 우선 조회 집중 테스트 |
| 관리자 큐 PUT는 알 수 없는 필드와 잘못된 값을 400으로 거부한다 | pass | route-handler malformed/empty/unknown-field 400 및 DB 무변경 테스트 |
| 약국 상세 강조 HTML은 원문 markup을 escape한다 | pass | escape-first highlight XSS 회귀 테스트 |
| HFF sync는 기존 파생 enrichment를 덮어쓰지 않는다 | pass | in-memory Turso conflict/new-row 소유권 테스트 |
| nearby는 유한한 범위의 radius만 받고 위도별 경도 범위를 사용한다 | pass | helper 및 실제 route 400 경계 테스트 |
| GitHub Actions가 필수 실패를 숨기지 않고 주석과 실제 cadence가 일치한다 | pass | 입력 allowlist, nonzero failure, YAML parse 및 정적 계약 테스트 |
| DB HTML/동적 JSON-LD가 저장형·반사형 XSS 우회를 차단한다 | pass | sanitize-html entity 우회 및 `</script>` 회귀 테스트 |
| 공개 API 동기화는 HTTPS 및 부분 실패 nonzero exit를 사용한다 | pass | HFF/medicine/enrichment 소스 계약과 script typecheck |

## User Flow Criteria

| Criteria | Status | Evidence |
|---|---|---|
| 데스크톱과 모바일에서 홈/소개/블로그/wiki 핵심 흐름이 통과한다 | pass | 외부 네트워크/운영 DB 격리 Playwright 22/22 |

## Stability And Error Handling

- 검증 실패를 숨기지 않고 원인과 영향 범위를 기록한다.
- 운영 DB/API/배포 등 외부 변경 명령은 실행하지 않는다.
- dependency audit에 critical/high 잔여가 있으면 완료로 선언하지 않는다.

## Documentation Criteria

- PROJECT_STATE.md에 기준 커밋, 검증, 위험, 다음 행동을 기록한다.
- EVIDENCE.md에 최초 실패, 수리, 재실행 결과를 append한다.

## Final Report Requirements

- implementation summary
- changed files
- validation level
- commands run
- acceptance status
- known limitations
- how to run

## 2026-08-27 Data-to-content acceptance

| Criteria | Status | Evidence |
|---|---|---|
| 가용한 공개 근거에서 최신 실행·관측 시점과 집계 범위를 쓰기 없이 확인하고 직접 DB 현재값 미확인 경계를 기록한다 | pass | `content/data-audits/2026-08-27.json`; Actions 실행 4건; 공개 sitemap 감사 |
| 미보강 데이터 기준과 확인 가능한 개수를 재현 가능한 방식으로 기록한다 | pass with boundary | auto-enrichment의 `nutrition_data` 누락 선택 규칙과 실패 후보 15개 기록; 전체 미보강 총량은 운영 DB 자격증명 부재로 미확인 |
| 기존 정적·발행 콘텐츠와 제목/slug 중복을 검사한다 | pass | 정적 route 22개, campaign 306행, 공개 발행 slug 712개, 블로그 60페이지에서 target match 0 |
| 실제 데이터에 근거한 로컬 콘텐츠 초안 또는 보강 산출물 1~3개를 만든다 | pass | noindex 데이터 업데이트 초안 1개와 supplement/medicine/additive 표현 보강 |
| 의료 효능 과장·개인 진단·복용 지시를 피하고 공식 출처 및 확인 경계를 명시한다 | pass | 식약처 인증·약사 검증·첨가물 부재 단정 제거, 공식 확인처·신규 허가 아님 경계 추가, Sol BLOCKER/HIGH 0 |
| 관련 lint/typecheck/test가 통과하고 외부 쓰기·발행·push·배포가 없다 | pass | lint, app/script typecheck, unit 13/13, build 57, isolated Playwright 24/24; 외부 mutation 0 |

## 2026-08-28 Search/CRO acceptance

| Criteria | Status | Evidence |
|---|---|---|
| sitemap lastmod는 실제 유의미한 수정일만 사용하고 요청 시각을 freshness로 만들지 않는다 | pass | 명시적 템플릿 개정일/콘텐츠 날짜만 사용; runtime sitemap 계약 단위 테스트 및 route smoke 통과 |
| 지원 종료 또는 실제 검색 기능과 불일치하는 WebSite SearchAction을 노출하지 않는다 | pass | layout에서 identity-only WebSite schema 사용; 재노출 가능한 helper 계약도 제거 |
| 홈·지역 metadata와 사용자 문구가 등록 영업시간 계산을 실시간 현장 상태로 과장하지 않는다 | pass | 실시간 보장 문구 제거, 등록 정보와 방문 전 전화 확인 경계 반영 |
| 검색→결과→상세→전화/길찾기 이벤트는 GA4에 전달되고 원문 검색어·전화번호·좌표는 전달하지 않는다 | pass | typed event allowlist unit test와 Playwright gtag payload 검사 통과 |
| 홈 결과에서 유효한 전화번호가 있으면 상세 페이지를 거치지 않고 44px 이상 CTA로 연락 의도를 실행할 수 있다 | pass | mocked nearby 결과 desktop/mobile CTA 및 `tel:` Playwright 검증 통과 |
| 정보 콘텐츠에서 가까운 약국 찾기로 이어지는 비과장 CTA가 제공된다 | pass | wiki/blog/guide CTA 정적 계약과 content-to-nearby Playwright 검증 통과 |
| 390/768/1366 뷰포트에서 핵심 탐색과 CTA가 겹치거나 잘리지 않는다 | pass | 세 viewport에서 document width 일치, overflow 없음, console error/warning 0 |
| lint, typechecks, unit, build, E2E가 통과하고 외부 상태 변경이 없다 | pass | lint; app/script typechecks; unit 20/20; build 55; E2E 28/28; commit/push/deploy 0 |

## 2026-08-28 API delta/content acceptance

| Criteria | Status | Evidence |
|---|---|---|
| 2026-08-27 이후 신규/변경 데이터 여부를 관측시각·count·명령과 함께 읽기 전용으로 고정한다 | pass | `content/data-audits/2026-08-28.json`; 82개 sitemap child, 공개 경로 증분 4종 모두 0, Actions run `33079730318` 기록 |
| 원천 API 응답, 사이트 DB 생성시각, 규제기관 허가·신고일을 서로 혼동하지 않는다 | pass | sitemap `lastmod`와 Actions 처리 로그를 공개 site-record 관측으로만 해석하고 규제기관 신규 허가·출시·개업 근거로 사용하지 않음 |
| 기존 정적·campaign·공개 발행 콘텐츠와 제목·slug·검색 의도 중복이 없다 | pass | 정적 route 23개와 registry, campaign 306행, 공개 sitemap 712개, 렌더링 목록 60페이지에서 target title/slug match 0 |
| 실제 변화가 있을 때만 데이터 기반 보강 또는 noindex 초안 1~3개를 Codex가 직접 작성한다 | pass | 가짜 신규 데이터 글은 만들지 않고 기존 월간 초안을 보강했으며, 검증된 이전 데이터에 기반한 라벨 가이드 1개를 외부 글쓰기 API 없이 작성 |
| 의료·건강 효능, 개업, 재고, 실시간 상태를 근거보다 강하게 주장하지 않는다 | pass | 기능성·효능·안전성·성분 부재를 추론하지 않는 경계, C003 출처 필터, 이름 기반 추론 중단; 최종 신뢰성 리뷰 BLOCKER/HIGH 0 |
| 공식 원문, 내부 링크 2개 이상, 가까운 약국 CTA와 미발행/indexing 경계가 명시된다 | pass | 식품안전나라·식약처 표시기준 링크, 표본 제품 3개와 `/wiki`·`/nearby`, noindex/nofollow·목록/sitemap 제외를 E2E로 검증 |
| lint, typechecks, unit, build, focused E2E가 통과하고 외부 mutation이 없다 | pass | lint; app/script typechecks; unit 22/22; build 56; Playwright 30/30; audit 0; DB/API 쓰기·발행·commit·push·배포 0 |

## 2026-08-28 Scheduled-content acceptance

| Criteria | Status | Evidence |
|---|---|---|
| 마지막 예약글의 제목·UTC·KST와 예약 run을 공개/Actions/코드 근거로 고정한다 | pass | run `33111937934`; `2026-09-21T12:00:00Z` = `2026-09-21 21:00 KST`; `content/schedule-audits/2026-08-28.json` |
| 예약 당시 pending insert와 현재 운영 DB 상태를 혼동하지 않는다 | pass with boundary | manifest에 `statusAtInsert=pending`, `currentStatus=unverified_without_production_db_select`를 별도 기록 |
| 검토 전 외부 생성 본문이 자동으로 추가되지 않도록 하되 기존 pending 발행 큐는 보존한다 | pass locally | `generate-blog.yml`은 schedule 제거·manual dispatch 유지; `publish-content.yml`과 기존 queue는 변경하지 않음; push 전 원격 효과 없음 |
| 다음 콘텐츠는 기존 정적·campaign·공개 발행 제목/slug와 중복되지 않고 공식 원문 및 검색 의도 차별점이 있다 | pass | 정적 24+registry, campaign 306, sitemap 712, rendered 713에서 match 0; 첨가물 신호 해석 정보 이득 |
| 신규 콘텐츠는 성분 부재·안전성·효능·개인 복용·재고를 단정하지 않고 noindex/unlisted 상태다 | pass | 직접 작성한 static draft, robots noindex/nofollow, blog registry/sitemap 제외, 공식 출처 3개와 E2E 경계 검증 |
| 제품 상세에서 설명 가이드와 측정 가능한 nearby CTA로 이어진다 | pass | `AdditiveSignal` 내부 링크와 desktop/mobile analytics payload E2E |
| 로컬 검증이 통과하고 외부 mutation이 없다 | pass | JSON/YAML; lint; both typechecks; unit 25/25; build 57; Playwright 32/32; reviewer BLOCKER/HIGH/MEDIUM 0; DB/workflow/publication/push/deploy 0 |
## 2026-08-28 completion follow-up acceptance

| Criteria | Status | Evidence |
|---|---|---|
| Operational DB jobs cannot report success without Turso credentials | pass | required-client helper and empty-env runtime smoke |
| Schema initialization fails when any non-ignored statement fails | pass | accumulated failures and nonzero exit contract |
| Overlapping publishers cannot publish/index the same pending row | pass | workflow concurrency, conditional update, executable double-claim test |
| Nearby and tag discovery preserve ordering/indexability rules | pass | ordered candidate query and shared predicate with in-memory SQL fixture |
| Current setup/status documentation is discoverable and unsafe examples are removed | pass | README, STATUS, docs map, blank admin password, least-privilege guide |
| Local regression suite passes | pass | lint; both typechecks; unit 27/27; build 57; E2E 32/32; audit 0 |
| New public API data is handled without unsupported content creation | pass | pharmacy/supplement/medicine delta 0; no new article generated |
| External mutations stay within authorization | pass | local changes only; no push/deploy/DB write/publication |
