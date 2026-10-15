# 애드센스 신청 준비 — 사실성·콘텐츠·기술 품질 개선 보고서

- 기준 커밋: `85723ef` (origin/main, 사전 검토 기준과 동일 확인) / 작업 브랜치: `fix/adsense-readiness-20261015` (worktree `E:\web\_worktrees\todaypharm\adsense-readiness`)
- 검토일: 2026-10-15
- 작업 상태(자체 표기, Google 승인과 무관): **CODE_READY** (코드·로컬 검증) / **NEEDS_PUBLISHER_CONFIGURATION** / **NEEDS_CONTENT_REVIEW** / **NEEDS_PRODUCTION_VERIFICATION**
- 원격 push·배포·운영 DB 쓰기·AdSense 계정 작업은 수행하지 않았다.

## 0. 작업 환경 메모

- 로컬 `E:\web\todaypharm`은 `origin/main`보다 4커밋 뒤이고 133개 미커밋 변경(design 브랜치)이 있어 **건드리지 않고** origin/main에서 별도 worktree를 만들어 작업했다. 사전 검토 대상 파일(`pharmacy-intelligence.ts` 등)은 로컬 체크아웃에 존재하지 않았다.
- 스테이징·운영 환경변수는 접근하지 않았다. 아래 "운영 확인" 항목은 모두 미검증이다.

## 1. 진단 결과 (재현 여부)

| # | 항목 | 분류 | 근거 |
|---|---|---|---|
| 1 | 영업시간 없음 → 9시간 기본값 | 현재 코드에서 재현됨 → **수정** | 구 `pharmacy-intelligence.ts` `stats.avgDailyHours ?? 9` |
| 2 | 비교군 없음 → 9.5시간·65%·28% | 재현됨 → **수정** | 구 `regionalAvgWeekdayHours = 9.5` 등 |
| 3 | 주말 미등록 → "정기 휴무" 단정, 일요일만 있으면 "연중 운영" | 재현됨 → **수정** | 구 `regularClosedSummary` |
| 4 | 고정 점수(95/72/40/92…)·"상위권" 평가 | 재현됨 → **제거** | 구 `scorePercent` |
| 5 | 22:00~익일 02:00 누락 | 재현됨 → **수정** | 구 `c > o` 조건 |
| 6 | 월요일 시간을 전체 평일로 일반화 | 재현됨 → **수정** | 구 `firstWeekdaySlot`, `pharmacy-detail-template.ts` |
| 7 | 외부 정보 없이 주차·결제·교통·혼잡 시간대 서술 | 재현됨 → **제거** | 구 `parkingNote`, `actionableTips` |
| 8 | 고정 "30% 가산/표준 조제 수가" 문구 | 재현됨 → **제거**(검증 대기) | 구 `surchargeWindowText` |
| 9 | 저장 리포트가 생성 함수보다 우선 | 재현됨 → **읽기 경로 차단** | 구 페이지 `intelligence_report ?? build(...)` |
| 10 | 광고 게시자 ID 기존 계정 하드코딩 fallback (코드 3곳 + compose/Dockerfile 기본값) | 재현됨 → **제거** | `site-config.ts`, `AdSlot.tsx`, `compose.production.yml`, `Dockerfile.production` |
| 11 | DB 오류가 0/[]/null로 바뀜 (사이트맵 id → `['static']`, 지역·위키 404) | 재현됨 → **수정** | `lib/data/*.ts`, 의약품 페이지, 위키 태그 |
| 12 | 운영 런타임에서 Turso 환경변수 누락 시 더미 클라이언트(빈 결과) | 재현됨 → **수정** | `lib/turso.ts` |
| 13 | `/wiki?type=medicine`: robots 차단 + noindex 동시 | 재현됨 → **수정(1페이지만 수집 허용)** | `robots.ts` |
| 14 | `next.config` 헤더가 사이트맵 503에 `s-maxage=86400` 덮어씀 | **장애 주입으로 새로 발견** → 수정 | 로컬 dev 장애 주입 |
| 15 | 사이트맵 chunk 정렬 보조키 없음(`created_at DESC`), pharmacies lastmod가 동기화 실행일 | 재현됨 → 수정 | `data/pharmacies.ts`, `sitemap-content.ts` |
| 16 | 존재하지 않는 지역 URL이 `index, follow` 메타 출력 | 로컬 재현 → 수정 | `[province]/[city]/page.tsx` |
| 17 | 개인정보처리방침이 실제 처리와 불일치(광고 상시 게재 서술, GA4 미기재) | 재현됨 → 수정 | `privacy/page.tsx` |
| — | `getPharmacyByHpid` DB 오류 전파, 처방전 사용기간 정정 문구 | **이미 해결** → 건드리지 않음 | 기존 코드·테스트 |
| — | 분석 이벤트 허용 목록, 리퍼러 정제, 광고 제외 경로, 쿠팡 배너 기본 차단 | **정상 확인** → 유지 | `client-analytics.ts`, `ad-policy.ts` |

## 2. 주요 변경

**리포트(P0)** — `pharmacy-intelligence.ts`를 v2로 재작성, `pharmacy-hours-profile.ts` 신설, `hours.ts`에 `classifyHourSlot` 추가(미등록/형식오류/시작=종료/익일 마감 분류).
- 미확인·미등록·계산 불가를 구분. 값이 없으면 null 또는 "미등록"/"확인 필요".
- 비교군은 **자기 자신·시간표 없는 약국 제외, 표본 5곳 미만이면 생성 안 함**(`MIN_PEER_SAMPLE`). 분모는 "등록 시간표가 확인된 약국"이며 화면에 표본 수와 기준 문구를 표시.
- 외부 장소 정보는 `matched && placeId`일 때만 사용. 후기 수 미조회는 null(0건 아님). 키워드 비율은 `ratioBasis`(참여자/투표 합계)를 표시.
- 비용 섹션은 "일반 안내"로 격하하고 고정 가산율·시간대 제거.
- **저장 리포트**: v1은 폐기(읽지 않음). v2도 본문을 쓰지 않고 검증된 `sourceExternal`만 꺼내 **현재 원천 데이터로 매번 재생성**. 손상 JSON은 null 처리. 제목·메타·OG·FAQ·JSON-LD 모두 같은 `resolvePharmacyReport` 사용. JSON-LD 영업시간은 유효 범위만 출력.
- `scripts/enrich-pharmacies.ts` 생성 경로를 v2로 맞추고, 비교군 조회를 `province+city`·`hpid` 포함으로 수정(구 코드는 hpid가 빈 문자열이라 자기 자신을 제외할 수 없었음).

**광고(P0)** — 게시자 ID 단일 출처 `getAdsenseClientId()`(형식 `ca-pub-` + 16자리, 미설정/오류는 빈 문자열). `getAdsenseState()`: `disabled`(광고·메타 없음) / `verification`(확인용 `google-adsense-account` 메타만) / `serving`(ID + `NEXT_PUBLIC_ADSENSE_SERVING_ENABLED=true`). 기존 `pageEligible=false` 기본값과 제외 경로 유지. `scripts/check-adsense-config.ts`(`npm run check:adsense`)가 ID·ads.txt·슬롯 일치를 점검.

**장애 구분(P0)** — `DataReadError` 도입, 공개 읽기 함수는 오류를 던지고 "없음"만 null/빈 결과. 사이트맵 라우트는 장애 시 `503 + no-store + Retry-After`. `/api/pharmacies`는 503. 의약품 페이지는 `cache()`로 메타데이터와 본문의 조회를 요청 단위로 일치.

**수집·색인(P1)** — `/wiki?type=medicine$`만 수집 허용(`&page=N`은 계속 차단: DB 읽기 방어). 사이트맵 chunk 정렬 보조키(`id`/`slug`) 추가, 동기화 실행일 기반 lastmod(약국·지역) 제거.

## 3. URL 유형별 정책표 (코드 기준 현황 + 이번 변경)

| URL 유형 | 수집 | index | canonical | 사이트맵 | 광고 | 근거 |
|---|---|---|---|---|---|---|
| 홈 `/` | 허용 | index | 자기 자신 | 포함 | `pageEligible` 미지정 시 차단 | layout, ad-policy |
| 지역 목록 `/{시도}/{시군구}` | 허용 | 존재+1페이지 index / 2페이지+·**없는 지역 noindex(신규)** | 자기 자신(페이지 포함) | 포함(lastmod 없음) | 차단(기본) | `[province]/[city]/page.tsx` |
| 약국 상세 `/pharmacy/{hpid}` | 허용 | `isIndexablePharmacy`(주소 + 전화 또는 시간표) | 자기 자신 | 인덱스 가능 건만 | **제외 경로** | pharmacy-indexability |
| 블로그 목록 | 허용(`?page=` 허용) | 1페이지 index, 2+ noindex | 자기 자신 | 포함 | 페이지별 `pageEligible` | blog/page.tsx |
| 블로그 본문 | 허용 | index | 자기 자신 | 포함 | 페이지별 `pageEligible` | blog/[slug] |
| 위키 목록 `/wiki` | 허용 | index | `/wiki` | 포함 | **제외 경로** | wiki/page.tsx |
| 위키 의약품 목록 `/wiki?type=medicine` | **허용(신규, 정확 일치만)** | noindex,follow | 자기 자신 | 제외 | 제외 | robots.ts, wiki/page.tsx |
| 위키 의약품 목록 `&page=N`·카테고리+페이지 | 의약품 `&page=` 차단 / 카테고리는 허용 | noindex | — | 제외 | 제외 | robots.ts |
| 위키 제품·의약품 상세 | 허용 | 품질 조건 미달(thin) noindex | 슬러그 정규형(리다이렉트) | 인덱스 가능 건만 | 제외 | wiki-indexability |
| 위키 비교 `/wiki/vs/*` | 허용 | noindex | 자기 자신 | 제외 | 제외 | vs/[compareId] |
| 위키 태그 `/wiki/tag/*` | 1페이지 허용, `?page=` **차단** | 1페이지 index, 2+ noindex | 자기 자신 | 제외 | 제외 | robots.ts — *noindex를 읽을 수 없는 트레이드오프, 변경은 승인 필요* |
| 검색·필터 쿼리(`/*?…`) | **차단**(`?page=`, `/wiki?category=` 예외) | — | — | 제외 | — | robots.ts, 비용 방어 |
| 소개·문의·약관·개인정보 | 허용 | index | 자기 자신 | 포함 | 문의·약관·개인정보 **제외** | — |
| 관리자·API | 차단(`robots`) + 앱 레벨 인증 | noindex | — | 제외 | 제외 | robots.txt는 접근 통제가 아님 |
| 존재하지 않는 URL | 허용 | not-found(noindex) | — | 제외 | 제외 | Next not-found |

`tests/unit/robots-policy.test.ts`가 robots 결과 16개 URL 유형을 위 표와 대조한다(Google 최장 일치 규칙 구현).

## 4. 콘텐츠·URL 조치 목록

> GSC·GA4 접근이 없어 **기존 유입 여부는 전부 "미확인"**이다. 아래 우선순위는 유입 확인 후 조정해야 한다.

| 대상 | 유형 | 문제·근거 | 조치 | 승인 |
|---|---|---|---|---|
| 약국 상세 전체(인덱스 가능 건) | A→B | 필드가 "있음"만 충족. 시간표 외 고유 정보 없는 건은 얇음 | **유지·보강**(이번에 허위 서술 제거). 유입 있는 상세부터 점검 | 불필요 |
| 저장 `intelligence_report` v1 행 | B | 기본 수치·휴무 추론 포함 가능 | 읽기 경로 차단 완료. `npm run audit:intelligence-reports`(읽기 전용)로 영향 건수 확인 후 v2 재생성 | **필요**(운영 DB) |
| `/blog/kids-fever-medicine-comparison`, `/blog/kids-fever-meds-check` | D | 체중별 mg/kg·mg 용량·투여 간격 다수(35줄) | 약사 검수 전 **검증 대기**. 수치는 일반 참고 범위와 일치해 보이나 근거 문서·적용 조건 미연결 | 필요 |
| `/blog/magnesium-deficiency-guide`, `vitamin-d-deficiency-guide`, `omega3-selection-guide`, `lutein-astaxanthin-guide` | D | 흡수율·용량·결핍 증상 수치(각 10~14줄) | 출처·기준연도 연결 또는 삭제, 검증 대기 | 필요 |
| `/blog/prescription-holiday-guide` | D | "응급실 가산 요금 발생 가능" 등 비용 문구 | 심평원·복지부 자료로 대조 후 수정 | 필요 |
| `/blog/hypertension-diabetes-holiday-tips`, `pregnancy-pharmacy-guide` | D | 만성질환·임신부 안내 | 검수 전까지 "검토 완료" 표기 금지 | 필요 |
| 처방전 사용기간 문구 | — | "처방전에 기재된 기간 확인"으로 정정돼 있음 | **되돌리지 않음** | — |
| `/blog/night-pharmacy-3steps` 등 "실시간" 표현 | D | 외부 서비스 기능을 "실시간"으로 서술 | 근거 문구로 교체 | 불필요 |
| 약국 상세의 `gemini_summary`/`ai_summary` 표시 블록 | D | AI 생성 요약이 검증 없이 노출 | 원문 대조 가능한 항목만 유지, 나머지 제거 검토 | 필요 |
| 위키 제품·의약품 중 thin | B | 이미 noindex 처리 | 유지 | 불필요 |
| `docs/…/API_CONTENT_WORK_PLAN.csv`의 `source_fields_required` 110건 | B | 원천 필드 부족 | 필드 확보 전 생성 금지 | — |
| `next-sitemap.config.js` | — | 빌드·Docker·CI 어디에서도 호출되지 않음(수동 `npm run sitemap`만). 실제 경로는 Next 라우트 | **삭제 보류**, 실행 금지 안내 | 필요 |
| 문의 메일 `support@todayyakuk.com` | — | 도메인이 `todaypharm.kr`과 다름. 수신 가능 여부 확인 불가 | 운영자 확인 | 필요 |

신규 대량 글은 만들지 않았다.

## 5. QA 결과

| 명령/방법 | 결과 | 데이터 | 비고 |
|---|---|---|---|
| `npm run test` (unit + intelligence + ads + robots + data-failure + api-content) | **PASS** (기존 42건 포함, 신규 약 30건) | 모의·로컬 sqlite | 기존 테스트 기대값은 약화하지 않았음 |
| 필수 회귀 1~10 | PASS (`pharmacy-facts.test.ts`) | 모의 | |
| 11·12 (없는 ID vs 장애, 복구) | PASS (`data-failure.test.ts`) + 로컬 dev 장애 주입으로 사이트맵 503·`no-store` 확인 | 로컬 파일 DB | |
| 13~15 (광고 상태) | PASS (`adsense-config.test.ts`) | 모의 | |
| 17 (robots 정책표) | PASS (`robots-policy.test.ts`) | — | |
| 로컬 dev 렌더링 (fixture 6종 + 비교군) | PASS: 시간표 없음/심야/일요일만/요일상이/옛 v1/손상 리포트 모두 렌더, 금지 문구 0건, 비교군 표본·기준 문구 노출 | 로컬 fixture | HTTP 상태는 dev 스트리밍상 전부 200이라 5xx/404 구분은 **미검증** |
| `npm run lint` | **PASS** (승인 후 실행, 테스트 파일 훅 이름 오탐 1건 수정) | — | |
| `npm run build` | **PASS** (59 라우트, DB 환경변수 없이 더미 DB로 빌드) | — | 빌드 산출물은 더미 DB 기준이라 사이트맵 chunk가 404로 prerender됨. 실제 배포 빌드는 DB 접근 필요 |
| `next start` 운영 모드 상태 확인 | **FAIL(기존 이슈 확인)** | 로컬 fixture | 없는 `/pharmacy/NOPE`, `/wiki/medicine/abc`가 **200 + CDN 캐시 헤더**(1일/10분). 원인: `loading.tsx` 스트리밍(루트 + `pharmacy/[id]` + `[province]/[city]`). `pharmacy/[id]/loading.tsx`만 제거해도 200 → 루트 loading 영향. 사이트 전체 UX 변경이라 **미수정, 승인 필요** |
| `npm run test:e2e` (Playwright) | **NOT_RUN** | — | 브라우저·서버 구성 미실행 |
| 16 (스테이징에서 실광고·운영 분석 전송 없음) | **NOT_RUN**(코드상 `isMigrationStaging` 분기 유지만 확인) | — | 스테이징 실측 필요 |
| 18 (필터·페이지네이션 DB 읽기 급증 없음) | **부분**: robots 정책으로 확인, 실측 NOT_RUN | — | |
| 19 (분석 이벤트 허용 목록) | 기존 `remediation.test.ts` 통과로 유지 확인 | 모의 | |
| 20 (모바일 검색·상세·전화·길찾기) | **NOT_RUN** | — | 상세 페이지 전화·길찾기 마크업은 변경하지 않음 |
| 운영 HTTP 상태(없는 hpid 404, 장애 시 5xx), GSC, PageSpeed | **BLOCKED**(운영·GSC 접근 없음) | — | |

## 6. 배포·신청 준비표

| 항목 | 상태 | 필요 조치 |
|---|---|---|
| 새 게시자 ID | **NEEDS_PUBLISHER_CONFIGURATION** | 계정 소유자가 `ca-pub-…` 제공. 임의 생성 안 함 |
| `public/ads.txt` | **변경 안 함**(기존 계정 항목 1줄 그대로) | 새 ID 확정 후 `google.com, pub-…, DIRECT, f08c47fec0942fa0` 구성. 기존 항목 유지/삭제는 두 계정 관계 확인 후 결정 |
| 환경변수 | `NEXT_PUBLIC_ADSENSE_PUB_ID` 신규 값, `…_SERVING_ENABLED=false`(인증 단계) | **빌드 시점에 인라인**되므로 Docker build arg(`TODAYPHARM_ADSENSE_PUB_ID`)로 전달 후 재빌드. 기본값은 이제 빈 값 |
| 슬롯 ID | 미입력 | `NEXT_PUBLIC_ADSENSE_SLOT_TOP/BOTTOM/INFEED`는 **새 계정 것만** |
| 사전 점검 | `npm run check:adsense` | 배포 전 CI/수동 실행, 오류 0건 확인 |
| 서빙 활성화 | 별도 승인 | 승인 확인 + 별도 결정 후에만 `SERVING_ENABLED=true` |
| 운영 데이터 보정 | 계획만 | ① `npm run audit:intelligence-reports`로 건수 확인 ② 백업(Turso 스냅샷/덤프) ③ 필요 시 `enrich` 재실행(v2) — 별도 승인 |
| 캐시 갱신 | 계획만 | `/pharmacy/*`는 ISR 24h. 즉시 반영하려면 `/api/revalidate`(secret) 경로별 호출. 범위: `/pharmacy/[id]`, `/[province]/[city]`, `/sitemap*` |
| 롤백 | 이전 이미지 태그로 복귀. 코드 변경은 DB 스키마·데이터 변경 없음 | |
| 배포 후 재검증 | `curl -I` 없는 hpid → 404 / DB 장애 시뮬레이션 → 5xx·사이트맵 503 / `/sitemap.xml`·`/ads.txt` 헤더·내용 / `/robots.txt` / 상세 페이지 금지 문구 0건 / GSC URL 검사(홈·상세·블로그·위키) | |
| 별도 승인 필요한 외부 작업 | push·배포, 운영 DB 쓰기, 애드센스 등록·검토 요청, GSC 설정, 문의 메일 수신 확인, EEA/영국/스위스 대상 광고 시 인증 CMP 도입 여부 | |

## 7. 알려진 한계·미확인

- **소프트 404(해결, 로컬 `next start` 검증)**: `loading.tsx` 스트리밍이 상태 코드를 200으로 확정하던 문제. `src/app/loading.tsx`, `pharmacy/[id]/loading.tsx`, `[province]/[city]/loading.tsx`를 제거했다. 결과: 없는 약국·의약품·지역은 404, DB 접근 불가 시 약국·위키·지역 페이지는 500. 부작용: 해당 경로 최초 렌더(캐시 미스) 동안 스피너 없이 서버 응답을 기다린다. 404 응답에도 `s-maxage=86400`이 붙으므로 새로 수집된 hpid는 CDN에서 최대 1일 지연될 수 있다. 운영 CDN 기준 재확인 필요(NEEDS_PRODUCTION_VERIFICATION).
- `unstable_cache`는 던져진 오류를 저장하지 않으나, ISR 재생성 실패 시 이전 페이지 유지 여부는 공식 문서에 명시가 없어 **NOT_VERIFIED**.
- 약국 `updated_at`은 동기화마다 갱신된다(`sync-pharmacies.ts`). 변경 시에만 갱신하도록 바꾸면 lastmod를 복원할 수 있으나 운영 동기화 변경이라 보류.
- "야간·공휴일 조제료 가산" 규정은 최신 심평원 고시와 대조하지 못해 **구체 수치를 모두 제거**했다. 추후 근거 확보 시 출처·기준연도와 함께 복원.
- `/api/` 전체 robots 차단으로 `/api/og` OG 이미지는 Google 크롤러가 직접 가져오지 못한다(소셜 크롤러는 별도 UA).
- 위치 좌표는 `GET /api/nearby?lat=&lon=`로 전송된다. 앱은 저장하지 않지만 프록시·호스팅 접근 로그에 남는지는 **운영 인프라 설정 확인 필요**(예시 Caddyfile에는 로그 지시문 없음). POST 전환은 캐시·구조 변경이라 승인 대상.
- 개인정보처리방침 문구는 코드 기준으로 정합화했을 뿐 법적 적합성을 확인한 것이 아니다.
