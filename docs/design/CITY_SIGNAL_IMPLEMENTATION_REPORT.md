# CITY SIGNAL 공개 페이지 적용 결과

2026-10-12 · 로컬 구현 완료 · 브랜치 `design/city-signal-20261012`
기준 HEAD: `81b02eb2d0aac6c0a36e895d05e4f8df34c31e18`
대상: `E:/web/todaypharm`. 운영 배포·운영 DB 작업·commit/push는 실행하지 않았습니다.

## 결과

승인된 CITY SIGNAL의 paper/ink/lime/coral 토큰, 네모 패널, 큰 제목, 노선도 SVG를 공개 템플릿 20종에 적용했습니다. 헤더·푸터·목록 제목을 공통 컴포넌트로 분리하고, 기존 원문과 검색/GPS/정렬/전화/지도/주소 복사·SEO/광고 정책을 보존했습니다. guide/blog/wiki 상세에는 실제 본문 제목으로 만든 목차를 연결했습니다. 페이지 오류·로딩 화면도 공통 색상과 버튼을 사용합니다.

모바일 메뉴는 키보드 Escape와 포커스 복귀를 지원합니다. 전화·길찾기 고정 버튼의 좁은 줄바꿈을 수정했습니다. 원본 coral은 장식에 사용하고 글자는 대비가 확보된 `#ac452a`를 사용합니다. 위키 보조 설명은 `#526354`로, white/paper/fog 대비 6.36/5.81/5.28:1입니다.

## 기능 검증에서 함께 수정한 문제

- Next 16.3.3에서 기존 `/api/og?title=...` 블로그 대표 이미지가 허용되지 않아 오류 경계가 표시됐습니다. 쿼리 허용을 기존 `/api/og` 경로에만 한정했습니다. 다른 로컬 이미지의 쿼리는 계속 차단합니다.
- 기존 한글 위키 canonical 비교가 인코딩된 `params.id`와 Unicode slug를 직접 비교해 같은 URL로 반복 리다이렉트했습니다. 기존 safeDecode를 한 번 적용해 비교하도록 수정했습니다. canonical URL 생성·metadata·색인 기준은 유지했습니다. UUID-only/옛 slug는 기존 canonical로 이동하고, 잘못된 인코딩과 이중 인코딩은 canonical로 인정하지 않습니다.
- `NutrientDisplay`의 근거 없는 검수 품질 문구를 실제 출처 미표시 안내로 바꿨습니다. 의료 본문·통계·법적 원문은 변경하지 않았습니다.

## 검증

| 검사 | 결과 | 증거 |
|---|---|---|
| `npm test` | PASS: 단위 46개 + API-content 2개 suite | [로그](../../.goal-harness/city-signal-20261012/runtime/npm-test.log) |
| `npm run lint` | PASS | [로그](../../.goal-harness/city-signal-20261012/runtime/lint.log) |
| `npx tsc --noEmit` | PASS | [출력 파일](../../.goal-harness/city-signal-20261012/runtime/typecheck.log), 성공 시 빈 출력 |
| 운영 DB 변수 비운 `npm run build` | PASS: 정적 페이지 58개 | [로그](../../.goal-harness/city-signal-20261012/runtime/build.log), dummy DB 경고 확인 |
| CITY SIGNAL 반응형·기능 E2E | 75/75 PASS, skip/flaky 0 | [JSON](../../.goal-harness/city-signal-20261012/runtime/results.json) |
| 영업시간·자정·처방전 회귀 E2E | 14/14 PASS | [JSON](../../.goal-harness/city-signal-20261012/runtime/p0/results.json) |
| 기존 E2E | 32/32 PASS | installed Chrome, local fixture :3256, `playwright test --workers=1 --reporter=list` |
| 독립 소스 리뷰 | PASS, 미해결 serious finding 없음 | [리뷰 기록](../../.goal-harness/city-signal-20261012/REVIEW.md) |

브라우저 테스트는 합계 121개입니다. 화면 검증은 390×844 / 768×1024 / 1440×900의 실제 Chrome에서 했습니다. 20개 정상·404 템플릿의 기대 제목과 **실제 표시 여부**, 이미지 로딩, JS 오류, 가로 넘침, 푸터 정책 링크를 확인하고 전체 페이지 스크린샷 60장을 저장했습니다. 초기 스트리밍의 숨겨진 h1/로딩 화면을 완료 증거로 사용하지 않습니다.

기능 테스트: 키워드 성공/빈 결과/서버 오류/짧은 검색어, GPS 허용/거부, nearby 정렬, mobile 메뉴/Escape, 전화·지도 대상, 주소 복사, 목차 이동, 위키 분류/검색/한글 canonical 상세/데이터 없음·비교 상태. 단위 테스트는 광고 fail-closed, 크롤러 쿼리·색인 기준, JSON-LD와 원문 일치, 운영시간·요청 세대 가드도 검사합니다. API·DB 스키마·Actions·환경 파일·광고 승인 상태는 변경하지 않았습니다. 새 패키지는 추가하지 않았습니다.

## 이전/이후와 실제 화면

이전 화면은 현재 HEAD의 별도 archive와 동일한 로컬 fixture로 재현했습니다. 운영 사이트의 이전 화면을 캡처한 것이 아닙니다.

- [메인 desktop 이전/이후](../../.goal-harness/city-signal-20261012/runtime/before-after-home-desktop.png)
- [메인 mobile 이전/이후](../../.goal-harness/city-signal-20261012/runtime/before-after-home-mobile.png)
- [20종 desktop 개요](../../.goal-harness/city-signal-20261012/runtime/review-overview-desktop.png)
- [20종 tablet 개요](../../.goal-harness/city-signal-20261012/runtime/review-overview-tablet.png)
- [20종 mobile 개요](../../.goal-harness/city-signal-20261012/runtime/review-overview-mobile.png)
- [약국 상세 mobile 전체](../../.goal-harness/city-signal-20261012/runtime/after-pharmacy-mobile.png)
- [블로그 mobile 전체](../../.goal-harness/city-signal-20261012/runtime/after-blog-mobile.png)
- [위키 제품 mobile 전체](../../.goal-harness/city-signal-20261012/runtime/after-wiki-product-mobile.png)

메인 통합 담당이 3종 개요의 모든 템플릿을 열어 검토했고, home/약국 상세/blog/wiki index·제품 상세의 전체 화면을 추가로 확인했습니다. 테스트에서만 쓰는 약국·제품·의약품·허브 레코드는 이름에 ‘화면검증/테스트’가 표시된 SQLite 합성 데이터입니다. 실제 제품 등록·영업·재고·정확성의 증거로 사용하지 않습니다.

## 라우트 대응

| 템플릿 | 확인한 라우트 |
|---|---|
| home | `/` |
| nearby | `/nearby` |
| region | `/서울특별시/강남구` |
| pharmacy | `/pharmacy/CITY-TEST` |
| guide | `/guide` |
| guide-article | `/guide/night-weekend` |
| blog | `/blog` |
| blog-article | `/blog/holiday-pharmacy-open-check` |
| wiki | `/wiki` |
| wiki-product | `/wiki/product/<test UUID>` → 한글 canonical |
| wiki-medicine | `/wiki/medicine/<test UUID>` → 한글 canonical |
| wiki-ingredient | `/wiki/ingredient/city-test` |
| wiki-compare | `/wiki/vs/<test UUID>_vs_<test UUID>` |
| wiki-tag | `/wiki/tag/비타민` |
| topic-hub | `/hub/city-test` |
| about / contact | `/about`, `/contact` |
| privacy / terms | `/privacy`, `/terms` |
| not-found | `/city-signal-missing-page` (404) |

## 에이전트와 진행 기록

OMX 계약 아래 native 역할 라우터를 사용했습니다. `explore`는 저장소/Next 소스 사실 확인, `executor` 두 레인은 home/nearby 및 guide/blog/wiki 구현, `code-reviewer`는 독립 리뷰를 맡았습니다. Main이 공통 UI·잔여 템플릿·통합·최종 검증을 담당했습니다. 동시 child는 최대 2개로 제한했고 후속 수리는 기존 child를 재사용했습니다. Team/autopilot나 추가 실행 ledger는 시작하지 않았습니다.

역할에 고정된 설치 모델 설정을 따랐습니다. 모델 설정은 청구·백엔드 telemetry가 아니므로 실제 비용 절감액이나 사용 모델을 계측한 결과로 주장하지 않습니다. 한 개 Goal Harness인 `.goal-harness/city-signal-20261012`에 목표·수용 기준·검사·리뷰·완료 상태를 기록했습니다.

## 예외·미검증·다음 실행 경계

- 실서비스/별도 운영 앱과의 코드 동기화, 운영 DB, 배포 후 화면·CWV(LCP/INP/CLS), 실제 AdSense/account 상태는 **미확인**입니다.
- 20종 템플릿의 대표 라우트를 검증했습니다. 모든 DB 레코드, 모든 게시글, pagination의 모든 페이지를 개별 캡처한 것은 아닙니다.
- 오류 화면 retry와 로딩 컴포넌트는 소스 리뷰로 확인했습니다. 의도적으로 실패를 주입한 전용 E2E는 추가하지 않았습니다.
- 자료에서 언급한 `pharmacy-intelligence.ts`는 이 checkout에 없어 지역 평균·근거 없는 예측치를 새로 만들지 않았습니다.
- 기존 untracked editorial/research/harness 파일은 보존했습니다. 이번 작업에서 지우거나 일괄 commit하지 않았습니다.
- 운영 반영은 별도 명시적 작업입니다. 이 결과에는 push/PR/배포/운영 DB 반영이 포함되지 않습니다.
- 검증용 서버 :3256/:3257은 작업 후 종료했습니다. 재현: `node tests/fixtures/city-signal-server.mjs`; 자동 검증: `npx playwright test --config tests/city-signal.playwright.config.ts`.
- 테스트용 SQLite와 baseline archive/node_modules junction은 runtime `.gitignore`에 한정해 Git 대상에서 제외했습니다. 스크린샷·로그·결과·자료는 보존했습니다.

## 변경 파일

공통 shell·토큰, home/nearby, 지역/약국, guide/blog/wiki, support/policy/state, 테스트로 변경을 나눴습니다. 전체 작업 파일 목록은 [changed-files.txt](../../.goal-harness/city-signal-20261012/runtime/changed-files.txt)에 있습니다. 디자인 원본은 `docs/design/city-signal-reference/todaypharm_city_signal_design/`에 보관했습니다.

### 기존 tracked 파일 수정

- `next.config.mjs`
- `playwright.config.ts`
- `src/app/[province]/[city]/page.tsx`
- `src/app/about/page.tsx`
- `src/app/blog/[slug]/page.tsx`
- `src/app/blog/data-update-2026-08/page.tsx`
- `src/app/blog/digestion-hangover-pharmacy-guide/page.tsx`
- `src/app/blog/holiday-open-pharmacy-tips/page.tsx`
- `src/app/blog/holiday-pharmacy-open-check/page.tsx`
- `src/app/blog/hypertension-diabetes-holiday-tips/page.tsx`
- `src/app/blog/kids-fever-medicine-comparison/page.tsx`
- `src/app/blog/kids-fever-meds-check/page.tsx`
- `src/app/blog/layout.tsx`
- `src/app/blog/lost-prescription-action-guide/page.tsx`
- `src/app/blog/lutein-astaxanthin-guide/page.tsx`
- `src/app/blog/magnesium-deficiency-guide/page.tsx`
- `src/app/blog/night-pharmacy-3steps/page.tsx`
- `src/app/blog/night-pharmacy-checklist/page.tsx`
- `src/app/blog/night-radius-tips/page.tsx`
- `src/app/blog/omega3-selection-guide/page.tsx`
- `src/app/blog/page.tsx`
- `src/app/blog/pharmacy-faq-top10/page.tsx`
- `src/app/blog/pharmacy-visit-checklist-3/page.tsx`
- `src/app/blog/pregnancy-pharmacy-guide/page.tsx`
- `src/app/blog/prescription-holiday-guide/page.tsx`
- `src/app/blog/prescription-prep-tips/page.tsx`
- `src/app/blog/probiotics-selection-guide/page.tsx`
- `src/app/blog/skin-trouble-first-aid-kit/page.tsx`
- `src/app/blog/summer-first-aid-kit/page.tsx`
- `src/app/blog/supplement-additives-label-guide/page.tsx`
- `src/app/blog/supplement-label-reading-guide/page.tsx`
- `src/app/blog/vitamin-d-deficiency-guide/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/error.tsx`
- `src/app/guide/call-navigation-tips/page.tsx`
- `src/app/guide/call-scripts/page.tsx`
- `src/app/guide/holiday-checklist/page.tsx`
- `src/app/guide/layout.tsx`
- `src/app/guide/night-weekend/page.tsx`
- `src/app/guide/page.tsx`
- `src/app/guide/radius-selection/page.tsx`
- `src/app/guide/summer-emergency-kit/page.tsx`
- `src/app/hub/[slug]/page.tsx`
- `src/app/layout.tsx`
- `src/app/nearby/NearbyClient.tsx`
- `src/app/not-found.tsx`
- `src/app/page.tsx`
- `src/app/pharmacy/[id]/page.tsx`
- `src/app/privacy/page.tsx`
- `src/app/terms/page.tsx`
- `src/app/wiki/ingredient/[name]/page.tsx`
- `src/app/wiki/layout.tsx`
- `src/app/wiki/medicine/[id]/page.tsx`
- `src/app/wiki/page.tsx`
- `src/app/wiki/product/[id]/page.tsx`
- `src/app/wiki/tag/[keyword]/page.tsx`
- `src/app/wiki/vs/[compareId]/page.tsx`
- `src/components/home/desktop-sidebar.tsx`
- `src/components/home/home-trust-sections.tsx`
- `src/components/home/recent-blog-posts.tsx`
- `src/components/pharmacy-card.tsx`
- `src/components/sticky-fab.tsx`
- `src/components/wiki/NutrientDisplay.tsx`
- `src/components/wiki/WikiSearch.tsx`
- `src/lib/wiki-slug.ts`
- `tailwind.config.ts`
- `tests/e2e/conversion.spec.ts`
- `tests/e2e/home.spec.ts`
- `tests/fixtures/p0-server.mjs`
- `tests/p0/hours-prescription.spec.ts`
- `tests/unit/remediation.test.ts`

### 신규 구현·테스트 파일

- `src/app/city-signal.css`
- `src/app/guide/EditorialToc.tsx`
- `src/app/guide/editorial-city.css`
- `src/components/city-signal/page-heading.tsx`
- `src/components/city-signal/site-header.tsx`
- `src/components/city-signal/site-footer.tsx`
- `public/city-signal/metro-map.svg`
- `public/city-signal/wiki-grid.svg`
- `tests/city-signal.playwright.config.ts`
- `tests/city-signal-p0.playwright.config.ts`
- `tests/city-signal/design.spec.ts`
- `tests/fixtures/city-signal-server.mjs`
