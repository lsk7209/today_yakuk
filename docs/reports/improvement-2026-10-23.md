# todaypharm 개선 작업 보고 (2026-10-23, 로컬 구현 단계)

상태 구분: **로컬 구현·테스트 완료** ≠ 비공개 환경 검증 ≠ 운영 반영 ≠ 의학적 검토 완료. 이 문서의 모든 항목은 운영 반영 및 사람 검토 전이다.

## 처리표
| 이슈 | 확인된 원인 | 변경 | 상태 |
|---|---|---|---|
| P0-1 성분 오해석 | C003 응답에 `NUT_MTR`가 없고, 두 스크립트가 `NUT_MTR \|\| STDR_STND`로 기준규격(중금속·시험·표시량 비율)을 영양성분 정규식에 투입. 정규식은 문장 중간 숫자도 채택 | `src/lib/nutrition-validation.ts`(의미 검증), 파서 항목 단위 엄격 매칭·추적 필드(parser_version/raw_text/validation), STDR_STND 입력 제거, 읽기 경로·사이트맵 SQL에 같은 규칙, JSON-LD brand 제거(제조사≠브랜드), `audit:supplement-facts` dry-run | 로컬 완료 / 기존 데이터 백필은 승인 대기 |
| P0-2 운영시간 | 로컬 템플릿은 "평일은 요일별로 다를 수 있음(예: 월요일 값)"처럼 예외를 숨김. 저장된 AI 소개문(content_queue/gemini_summary)은 근거 검증 없이 노출 | `src/lib/operating-schedule.ts` 단일 정규화 → 요약·FAQ·JSON-LD 공통 사용, 공휴일 "미확인" 표기, `pharmacy-claims.ts`로 근거 없는 주장(리뷰·도보·통계·주차·결제·연중무휴·미등록 시각) 포함 소개문 대체 | 로컬 완료 |
| P0-3 건강 콘텐츠 | DUR 2등급 정의 오기(공식: 사람에서 태아 위해성이 나타날 수 있는 경우), 베이킹소다·용량·"1차 선택 약제" 권고, 비타민D 75% 수치·증상 2개 규칙·용량 | 해당 문장 제거/공식 정의로 교체(새 복용법 미생성), 요금 공통 안내 `fee-notice.ts`(HIRA 토요일 09~13시, 3개 항목 30% 가산), `audit:health-content` 검토 큐 | 개발 수정 완료 / **사람(약사) 검토 대기** |
| P0-4 초안 공개 | 정적 라우트 3종이 noindex 메타뿐이라 직접 URL 200. 편집 글용 404 로직도 `proxy.ts`에 없음 | `STATIC_BLOG_PUBLICATION_POLICY` + `proxy.ts`에서 비공개 슬러그 404(관리자 토큰만 미리보기, noindex·no-store), 초안으로의 공개 링크 제거 | 로컬 완료 / 배포 후 CDN 캐시 확인 필요 |
| P1 모바일 | 결과가 소개·일러스트·사용법 뒤에 위치 | 결과를 검색폼 바로 다음으로, 사용법은 결과 뒤, 모바일에서 장식 숨김, 제출 후 결과 헤더 포커스, 0건/오류+재시도/권한거부, 오늘 시간표 표시, 좌표 없으면 거리 숨김·거리순 비활성, 0건 시 17개 시·도 | 로컬 완료(Edge 헤드리스 e2e 8/8) |
| P2 정책 | `/wiki` 페이지네이션·카테고리가 canonical을 `/wiki`로 통일, `?type=` 미처리, 검증 실패 성분 제품이 태그만으로 색인 적격 | canonical 자기참조(noindex 유지), 알 수 없는 쿼리 noindex, 성분 전부 검증 실패 시 색인 부적격 | 로컬 완료 |
| P2 분석 | 허용목록 기반 전송은 이미 존재 | `location_permission_result`(결과만, 좌표 없음) 추가 | 로컬 완료 / GA4·GSC·CWV 실측은 접근 대기 |

## URL 유형별 정책(구현 기준)
| 유형 | 공개 | robots | canonical | sitemap |
|---|---|---|---|---|
| 홈·지역 목록 1페이지 | 200 | index | 자기 자신 | 포함 |
| 지역 목록 `?page>1` | 200 | noindex,follow(robots.txt 허용 → 읽힘) | 자기 자신 | 제외 |
| 약국 상세 | 200 | `isIndexablePharmacy` | 자기 자신 | 적격만 |
| `/wiki` | 200 | index | `/wiki` | 포함 |
| `/wiki?page=N`, `?category=` | 200 | noindex,follow | **자기 자신(변경)** | 제외 |
| `/wiki?type=…` 등 미정의 쿼리 | 200 | **noindex(변경)**, 단 robots.txt `/*?`가 차단 → 크롤러가 noindex를 못 읽음(비용 보호 의도, 링크·sitemap에 없음) | `/wiki` | 제외 |
| 상품 상세 | 200 | 검증된 성분 또는(성분 없는) 태그만 index | 자기 자신 | SQL 술어 동일 |
| 글(게시) / 초안 | 200 / **404(관리자만 미리보기)** | index / — | — | 포함 / 제외 |

## 데이터 후속(승인 필요)
1. `npm run audit:supplement-facts` (SELECT 전용; 운영 자격증명 필요 → 아직 미실행). 결과의 `rejectedByIssue`, `productsLosingAllFacts` 확인.
2. 승인 시 백필 스크립트는 별도 작성(대상 id 목록 백업 → `nutrition_facts`에서 거부 항목만 제거 → 사이트맵/ISR 재검증). 복구: 백업 JSON으로 UPDATE.
3. **결정 필요:** 현재 모든 저장 성분의 출처가 `STDR_STND`였을 가능성이 높음(C003에 NUT_MTR 없음). 통과한 "정상" 값도 1회 섭취량 기준이 아닐 수 있음. 새 파서는 NUT_MTR만 받으므로 `sync:supplements`는 현재 신규 성분을 만들지 않고 "no data"로 실패 처리됨 → 올바른 영양성분 소스(다른 API/라벨 데이터) 확정 필요.
4. 저장 AI 소개문(content_queue.ai_summary 등)은 화면에서만 걸러짐. 원본 정리는 별도 승인.

## 사람 검토 대기
- `docs/reports/health-content-review-queue.json` (30개 파일). 특히 임신·수유 글의 나머지 약물 언급(수유 중 성분, 변비 하제 등), 비타민D 혈중 기준(20/30 ng/mL), 공휴일 가산료 서술(prescription-* 글).
- 토요일 요금 안내문(`fee-notice.ts`): 검토 완료 아님. 공휴일·야간 가산은 원문 미확인으로 미포함.

## 배포 준비
순서: 코드 배포 → 초안 3종 404 확인(`curl -I`) → CDN/ISR 캐시에서 구 페이지 잔존 여부 확인(필요 시 승인 후 재검증) → 사이트맵 재생성 → dry-run 결과 검토 후 백필. 롤백: 이전 배포 복원(스키마 변경 없음, 신규 환경변수 없음).
기존 공개 상태였던 초안 3종은 404로 회수됨(검색 노출 이력이 있으면 GSC 삭제 요청은 승인 후).

## 실행한 검증
`npm run test:unit`(remediation + nutrition-validation 8 + pharmacy-schedule 7 + draft-publication 3) 종료코드 0, `npm run test:api-content` 0, Playwright(Edge 채널, chromium) tests/e2e 전체 passed(mobile-search 8, 초안 익명 404 3 + 관리자 미리보기 본문 3 포함). lint/tsc/build는 규칙상 Stop hook이 처리하므로 직접 실행하지 않음. 변경 전후 스크린샷은 미캡처.
