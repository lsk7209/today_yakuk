# TodayPharm 품질 감사

기준 시각: 2026-09-12 KST. 이 문서는 로컬 저장소와 읽기 전용 Turso 조회 결과를 구분한다.

## 실제 시스템

- 저장소: `35_today_yakuk`, 대표 URL 생성값 `https://todaypharm.kr`. 실제 프로젝트로 확인했다.
- 웹: Next.js 14.2.35 App Router, React 18, TypeScript 5, npm lockfile. 로컬 `dev`, `lint`, `build`를 사용한다.
- 데이터: 현재 런타임 읽기/쓰기는 `@libsql/client` 기반 Turso/libSQL이다. `supabase/`는 과거/보조 SQL 흔적이며 현재 공개 조회의 단일 근거로 가정하지 않는다.
- 콘텐츠: 정적 App Router 가이드·블로그와 Turso `content_queue` 동적 블로그가 병존한다. 위키는 `supplements`, `medicines`, `ingredients`, 약국은 `pharmacies`를 사용한다.
- 자동 작업: GitHub Actions가 약국/위키 원천 동기화, 블로그 생성, 시간별 공개 큐 처리, 수동 품질 보정을 실행한다. 배포는 Vercel 프로젝트 흔적과 원격 성공 기록이 있으나 이번 작업은 배포하지 않는다.
- 광고: 루트 레이아웃의 AdSense 스크립트와 전역 쿠팡 배너, 블로그 슬롯이 있었다. 소유권 meta와 광고 요청이 같은 설정으로 사실상 묶여 있었다.
- SEO: App Router `robots.ts`, 동적 sitemap index/청크, route metadata/canonical, RSS/feed가 병존한다.

## 라이브 읽기 전용 현황

| 데이터 | 건수 | 최신 확인값 |
|---|---:|---|
| 콘텐츠 큐 | 788 | 최종 재생성 snapshot: published 759, pending 29 |
| 약국 | 26,148 | `updated_at` 최대 2026-09-10T21:22:31.595Z |
| 영양제 | 48,378 | `created_at` 최대 2026-09-06 21:33:30 |
| 의약품 | 4,981 | `updated_at` 최대 2026-09-09T11:25:13.527Z |

이는 DB 레코드/후보 URL 수이며 실제 Google 색인 수나 유입 수가 아니다. 좌표와 자격증명은 감사 출력에서 제외했다.

## 확정 결함과 수정

1. 광고 제어 결합: 루트에서 AdSense 스크립트와 제휴 배너가 대부분의 화면에 생성됐다. 광고 serving과 소유권 meta를 분리하고, serving/affiliate를 각각 fail-closed 환경 플래그로 만들었으며 nearby/wiki/pharmacy/정책/API/관리 화면을 공통 제외했다.
2. 영업시간 계산: 기존 코드는 KST 변환 외에 익일 종료, 24:00 검증, 동일 시작·종료의 불확실성, 알려진 공휴일의 별도 정보 부재를 처리하지 못했다. 순수 계산 함수와 경계 fixture를 추가했다.
3. 상태 결합: `status` 하나로 생성·검토·공개가 섞였고 본문만 있으면 예약 글이 자동 공개됐다. 독립 정책 resolver, additive schema, 기존 공개 backfill, 검수·출처·본문 hash 발행 gate를 추가했다.
4. 비공개 누출: 약국 관련 콘텐츠 조회가 `pending`도 반환했다. 공개 조회를 published로 제한하고 공통 publication resolver를 직접 URL/목록/API/sitemap 데이터 함수에 연결했다.
5. 위키의 근거 없는 표현: “약사가 검증”, “전문가 분석”, 첨가물이 “검출되지 않았다”는 시험 결과식 표현이 코드에 있었다. 등록/수집 표시정보라는 실제 범위로 수정했다.
6. 브랜드 불일치: footer/RSS에 `TodayPharmacy`가 남아 있었다. footer는 `TodayPharm`으로 고쳤고 RSS는 후속 정리 대상으로 기록했다.
7. 자동 생성 위험: 생성과 공개가 분리돼 있으나 공개 작업은 검수·출처 없이 통과 가능했다. 새 gate는 마이그레이션 미적용 상태에서도 자동 공개를 중단한다.
8. sitemap 정합성: 위키 전 레코드를 단순 수량으로 청크화하고, 정적 페이지 lastmod에 실행 시각을 사용하며, 약국 상세는 sitemap 청크 ID에 포함되지 않는다. 대량 URL 정책 결정이 필요해 운영 목록 전환은 하지 않았고 후속 승인/구현 대상으로 남겼다.
9. canonical wiki redirect 반복: 한글 canonical slug가 인코딩된 route param과 직접 비교되어 정상 URL도 redirect payload만 반환했다. route slug를 decode/normalize한 뒤 비교하도록 고쳤다.
10. 약국 상세 XSS 경계: DB 유래 설명과 bullet을 강조 표시용 HTML로 만들기 전에 escape하지 않았다. 텍스트를 먼저 HTML escape하고 검증된 강조 태그만 추가하도록 고쳤다.
11. 중복 route: `/hub/[slug]`가 `/blog/[slug]`와 같은 본문을 canonical 없이 제공했다. 유효한 기존 URL은 해당 blog canonical로 영구 redirect한다.
12. API 입력 경계: wiki 검색의 음수/NaN `limit`가 무제한 SQL LIMIT으로 이어질 수 있었다. 1~50 범위로 clamp한다.

## 콘텐츠 품질 측정

- 초기 published 758개 snapshot의 본문 완전 중복 그룹은 0개였으나, 반복 문단 그룹 230개가 확인됐고 539개가 영향을 받는다. 작업 중 외부 스케줄로 1건이 published 전환되어 최종 inventory는 759/29다.
- 초기 snapshot에서 1,500자 미만 published 글은 241개다. 정확히 같은 제목 1개 그룹(2 URL)이 있다.
- 구조적 분류 결과는 `REWRITE 509`, `HOLD 301`이다. 이는 자동 삭제·비공개 결정이 아니라 수동 검토 우선순위다.
- 30개 핵심 후보는 `완료 0 / 부분 완료 15 / 초안 5 / 자료 부족·보류 10`이다. 파일 존재나 길이 검증을 의료·제도 검수 완료로 간주하지 않는다.

## 관찰 또는 검증 제한

- 로컬 primary는 원격보다 ahead 2 / behind 19이며 기존 작업이 많다. 현재 remote Next.js 16과 이 checkout Next.js 14의 통합 배포 증거는 별개다.
- 트래픽/GSC 실제 색인/AdSense 계정 Auto ads 제외는 이번 로컬 감사에서 확인하지 않았다.
- 80,335개 URL(동적 80,295 + 정적 40) 메타데이터/소스는 전수 규칙 검사했지만 본문 의미 검토는 위험 패턴 후보 생성 단계다. 패턴 결과는 사람 판정이 아니다.
- 정적 블로그의 의료·제도 주장은 다수 남아 있다. 면책문구만 추가하지 않고 `CLAIM_REVIEW.csv` 및 핵심 계획에서 보류했다.

## 공식 정책 재확인

- Google의 `noindex` 문서는 crawler가 태그를 읽을 수 있어야 하며 robots 차단과 혼동하면 안 된다고 설명한다: https://developers.google.com/search/docs/crawling-indexing/block-indexing
- sitemap은 canonical/index 희망 URL을 포함하며 제출은 힌트일 뿐 색인을 보장하지 않는다: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- AdSense 연결은 code, ads.txt, meta 방식이 가능하므로 광고 serving 중단과 소유권 확인을 분리할 수 있다: https://support.google.com/adsense/answer/7584263
- publisher content가 없거나 자동 생성 후 수동 검토가 없는 화면의 광고는 제한 대상이다: https://support.google.com/publisherpolicies/answer/11112688
