# GOAL

## Final Deliverable

Today Yakuk 감사에서 확인된 보안·데이터 무결성·의존성·E2E·자동화 결함을 최소 변경으로 수정하고, 로컬 검증 증거와 재개 가능한 상태 문서를 남긴다.

## User Value

공개 페이지에 검토 전 콘텐츠나 저장형 스크립트가 노출되지 않고, 관리자 수정 입력과 외부 XML 처리 경계가 안전하며, 핵심 사용자 흐름과 자동화 실패가 신뢰성 있게 검증된다.

## Required Features

- 공개 약국 페이지는 `published` 콘텐츠만 조회한다.
- 관리자 큐 수정은 허용 필드와 타입만 SQL 업데이트에 전달한다.
- DB/API/AI 문자열을 HTML로 강조할 때 원문을 먼저 escape한다.
- `fast-xml-parser`를 감사상 안전한 버전으로 갱신하고 잠금파일을 일치시킨다.
- HFF 동기화는 source-owned 필드만 갱신하고 파생 enrichment를 보존한다.
- nearby 입력 검증 및 경도 bounding box 계산을 보완한다.
- Playwright 실패 5건과 GitHub Actions의 실패 은폐/주기 문서 불일치를 수정한다.
- lint, typecheck, dependency audit, build, 전체 E2E를 재검증한다.

## Non-Goals

- 운영 DB 쓰기·마이그레이션, 외부 API 호출, 콘텐츠 발행, 배포, Vercel 설정 변경
- 분산 rate-limit 저장소 도입이나 폐업 데이터용 운영 스키마 변경
- Git commit/push (별도 요청 전까지)

## Done Conditions

- 신규 집중 테스트와 기존 22개 E2E가 모두 통과한다.
- lint, typecheck, production build가 통과한다.
- `npm audit --omit=dev`에서 현재 수정 대상인 critical/high가 해소되거나 직접 영향이 명확히 기록된다.
- Sol 보안 리뷰의 BLOCKER/HIGH가 0건이며 Terra 테스트 리뷰의 실질적 HIGH가 해결된다.
- EVIDENCE/ACCEPTANCE/PROJECT_STATE가 실제 결과와 일치한다.

## User-Visible Result

수정된 로컬 저장소, 통과한 검증 결과, 남은 운영 경계와 Git 인계 상태를 받는다.

## 2026-08-27 Data-to-content pass

- Goal: 운영 데이터의 최신 수집 시점과 미보강 레코드를 읽기 전용으로 확인하고, 실제 데이터에 근거한 소수의 로컬 콘텐츠 초안 또는 보강 산출물을 만든다.
- Done: 데이터 스냅샷·중복 검사를 재현할 수 있고, 새 산출물이 의료 효능을 과장하지 않으며, 관련 품질 검증이 통과한다.
- Boundary: DB/API 쓰기, 콘텐츠 발행, 워크플로 실행, commit/push, Vercel 작업은 수행하지 않는다.

## 2026-08-28 Search acquisition and conversion pass

- Goal: 검색엔진이 실제로 갱신된 고유 페이지를 신뢰성 있게 발견하도록 기술 SEO 신호를 바로잡고, 방문자가 검색 결과에서 약국 전화 또는 길찾기 의도까지 더 짧게 도달하도록 로컬 제품 흐름을 개선한다.
- Primary conversion: `pharmacy_contact_intent` 또는 `pharmacy_directions_intent`. 실제 통화 연결, 재고, 방문, 구매는 관찰할 수 없으므로 전환으로 주장하지 않는다.
- Supporting events: 원문 검색어·전화번호·좌표를 보내지 않는 `search`, `pharmacy_results_loaded`, `pharmacy_detail_view`, `content_to_nearby_click`.
- Done: 허위 freshness/지원 종료 schema/실시간 과장 표현이 제거되고, 검색-결과-상세-전화/길찾기 이벤트와 핵심 CTA가 동작하며, 모바일·데스크톱 SEO/UX 계약 검증이 통과하고 재개 가능한 증거가 기록된다.
- Boundary: 로컬 T1/T2 코드·콘텐츠 표현 수정만 수행한다. GSC/GA/DB 쓰기, 발행, workflow 실행, commit/push, Vercel·배포 작업은 수행하지 않는다.

## 2026-08-28 API delta to content follow-up

- Goal: 2026-08-27 고정 스냅샷 이후 공개 API 수집 실행과 공개 sitemap에서 실제 신규·변경 데이터를 읽기 전용으로 확인하고, 날짜 의미와 관측 경계를 보존한 데이터 기반 콘텐츠 보강 또는 로컬 noindex 초안 1~3개를 만든다.
- User value: 독자는 최신 데이터가 무엇을 뜻하는지 과장 없이 이해하고 관련 제품 정보나 가까운 약국 탐색으로 이어갈 수 있다.
- Done: 변화 증거와 중복 범위가 재현 가능하고, Codex가 직접 작성한 산출물이 공식 원문·금지 주장·CTA·indexing 상태를 명시하며, 관련 품질 검증과 독립 리뷰를 통과한다.
- Boundary: 외부 LLM/API로 본문을 생성하지 않는다. DB/API 쓰기, workflow dispatch, 공개 발행, commit/push, Vercel·배포는 수행하지 않는다.

## 2026-08-28 Scheduled-content follow-up

- Goal: 공개 페이지, GitHub Actions 로그와 저장소 scheduler를 교차해 마지막 예약글의 제목·시각을 고정하고, 다음 후보 슬롯에 맞는 비중복·저위험 콘텐츠 1개를 로컬 검토용으로 준비한다.
- User value: 예약 현황을 KST 기준으로 정확히 알고, 검토되지 않은 외부 생성 본문이 자동으로 계속 쌓이는 위험을 줄이면서 검색 의도와 제품 상세 설명을 보강한다.
- Done: 예약 이벤트와 현재 DB 상태를 구분한 manifest, 수동 실행만 남긴 generation workflow, 공식 원문 기반 noindex 초안, 제품 상세 해석 링크와 unit/build/desktop-mobile E2E 증거가 존재한다.
- Boundary: 기존 pending 큐와 publish workflow는 변경하지 않는다. 운영 DB 조회·수정, workflow dispatch, 실제 예약·발행, commit/push, 배포·Vercel 작업은 수행하지 않는다.
