# 애드센스 승인 준비도 검토 (약국오늘 / todaypharm.kr)

- 검토일: 2026-10-22
- 상태 전제: 신청 전. 승인 보장 없음. 이 문서는 코드·문서 정적 점검 결과이며 라이브 사이트, Search Console, AdSense 계정은 확인하지 못했다.
- 기준: adsense-playbook의 5개 관문과 YMYL 규칙.

## 1. 요약

| 관문 | 판정 | 핵심 |
|---|---|---|
| 1. 평가 가능성 | 양호 | robots 정상, ads.txt 존재, `google-adsense-account` 메타 존재. 게재 플래그는 기본 `false`라 신청 전 의도적으로 꺼 둔 상태 |
| 2. 독자적 가치 | **최대 리스크** | 약국 약 26,000개 상세 페이지는 공공데이터 재가공이라 고유 가치 증명이 약함 |
| 3. 주제·탐색 구조 | 양호 | 약국 찾기, 가이드, 블로그, 위키로 독자 흐름이 이어짐. 건기식·의약품 위키가 범위를 넓힘 |
| 4. 운영 투명성 | **보완 필요** | 실명 운영자·감수자 없음, 문의 메일 도메인 불일치, 개인정보처리방침 광고 고지 누락(이번에 수정) |
| 5. 트래픽·정책 | 확인 불가 | GA4·GSC 데이터가 없어 판단 불가 |

## 2. 이번 작업에서 수정한 것

1. `src/app/privacy/page.tsx`: 신규 5장 "광고·분석 도구 및 쿠키 고지" 추가
   - Google 등 제3자 공급업체의 쿠키 사용, DART 쿠키, 맞춤 광고 해제 링크(adssettings.google.com, aboutads.info), Google 파트너 사이트 정책 링크
   - Google Analytics 사용, 쿠팡 파트너스 제휴 고지
   - 최종 개정일 표기. 이전에는 시행일 2025-01-01뿐이었고 애드센스 쿠키 문구가 단편적이었다.

## 2-1. 후속 조치 (2026-10-22, 사용자 결정 반영)

- 문의·개인정보 책임자 메일을 `cs@todaypharm.kr`로 통일 (메일 수신 설정은 불필요하다고 확인)
- 서비스 성격을 "의료 행위가 아닌 공공데이터 큐레이션"으로 보고, 약사 감수 대신 `/about#editorial-policy`에 데이터 출처·갱신 주기·AI 활용·면책을 공개
- 쿠팡 파트너스 배너 컴포넌트, 레이아웃 삽입, 관련 테스트·개인정보 고지·`isAffiliateAdsEnabled`를 제거
- 중복 블로그 글 4개를 대표 글로 301 통합 (`next.config.mjs`)
  - `night-pharmacy-checklist`, `night-radius-tips` → `night-pharmacy-3steps`
  - `holiday-open-pharmacy-tips` → `holiday-pharmacy-open-check`
  - `kids-fever-meds-check` → `kids-fever-medicine-comparison`
  - 블로그 목록, sitemap, RSS, ai-index, 가이드 페이지의 내부 링크도 정리. `prescription-holiday-guide`는 처방전 의도로 구분되어 유지
- 약국 상세 색인 강화: 환경변수 `PHARMACY_INDEX_REQUIRES_ENRICHMENT=true`일 때 고유 분석(intelligence report)이 있는 약국만 색인·sitemap 포함. 기본은 꺼짐(보완 비율을 모르는 상태에서 색인이 급감하는 것을 방지). `npm run enrich:pharmacies:stats`로 보완 비율을 확인한 뒤 켤 것. 보완 파이프라인은 영향 없음
- Search Console 수치는 이 환경에 자격 증명이 없어 확인하지 못함 (`npm run gsc:sitemap:status`를 자격 증명이 있는 환경에서 실행 필요)

## 3. 발견 사항 (우선순위순)

### P0. 신청 전에 해결할 것

**3-1. 연락처 도메인 불일치**
- 사이트 도메인은 `todaypharm.kr`인데 문의·개인정보 책임자 메일이 `support@todayyakuk.com`이다 (`src/app/contact/page.tsx:67`, `src/app/privacy/page.tsx`).
- 도메인이 다르면 운영 실체 확인에서 신뢰를 잃는다. 실제 수신 가능한 메일인지 확인하고, 가능하면 `todaypharm.kr` 도메인 메일로 통일할 것. 실제 사용 중인 주소를 알 수 없어 코드는 수정하지 않았다.

**3-2. 운영자·감수자 실명 부재 (YMYL)**
- `site-persona.yaml`이 "약국오늘 정보팀"을 저자로 두고 "처방·진단 자격 없음"을 밝히고 있다. 솔직한 방식이지만 의약품·건기식 글(`kids-fever-medicine-comparison`, `pregnancy-pharmacy-guide`, `hypertension-diabetes-holiday-tips`, 영양제 가이드)은 의료 YMYL로 분류된다.
- 조치안(택1 이상):
  - 약사 1인과 감수 계약을 맺고 해당 글에 "약학 감수: OOO 약사" 표기와 `reviewedBy` schema 추가
  - 감수 체계를 못 만들면 복약·용량·임신·소아 관련 글은 비색인하거나 약국 안내 중심으로 축소
- `Article.author`는 지금 전부 Organization이다. 운영자 실명 프로필 페이지(`/about` 내 또는 `/authors`)가 필요하다.

**3-3. 편집 정책·데이터 출처·갱신 주기 페이지 없음**
- 어떤 데이터를 쓰고(응급의료정보, 식약처 등), 어떻게 갱신하며(매일 04:00 KST), AI를 어디까지 썼는지 공개하는 페이지가 없다. `site-persona.yaml`에는 AI 공개 문구가 있으나 푸터 노출이 확인되지 않았다.
- `/about`(25KB)에 "편집 정책" 섹션을 넣거나 `/editorial-policy`를 신설할 것.

### P1. 콘텐츠 품질

**3-4. 약국 상세 페이지 대량 색인**
- `isIndexablePharmacy`는 주소와 전화 또는 영업시간만 있으면 색인 허용한다. 약 26,000개 페이지가 같은 템플릿에 값만 바뀌는 구조라면 애드센스의 "고유 콘텐츠 거의 없음"과 Google의 scaled content 판단에 불리하다.
- 현재 `/pharmacy`, `/wiki`, `/nearby` 등은 `ad-policy.ts`에서 광고 제외 경로라 광고 정책 위반 위험은 낮다. 다만 사이트 전체 평가에서 얇은 페이지 비율은 영향이 있다.
- 조치안: 색인 기준에 "고유 정보 N개 이상(야간·휴일 운영, 약사 정보, 주변 지표 등)"을 추가하고, 기준 미달은 `noindex, follow`. 신청 기간 동안 sitemap 노출을 상위 품질 약국으로 한정하는 방안도 있다.

**3-5. 블로그 주제 중복**
- 의도가 겹치는 글: `night-pharmacy-3steps`, `night-pharmacy-checklist`, `night-radius-tips` / `holiday-open-pharmacy-tips`, `holiday-pharmacy-open-check`, `prescription-holiday-guide` / `kids-fever-medicine-comparison`, `kids-fever-meds-check`.
- 각 그룹을 하나의 강한 글로 통합하고 나머지는 301. `npm run audit:content-duplicates`로 근접 중복도를 먼저 확인할 것.
- 일부 글은 이미 `robots: noindex` (`supplement-*-label-guide`, `medicine-permit-label-reading-guide`, `data-update-2026-08`)다. 승인용으로 유지 가치가 있는지, 보강해 색인할지 결정이 필요하다.

**3-6. 직접 경험·측정 자료 부족**
- 정적 글 25개는 평균 약 20KB로 분량은 충분하나, 공공자료 정리 중심이다. 고유 자료 후보: 지역별 야간·휴일 운영 약국 통계(자체 집계), 월별 데이터 갱신 리포트, 전화 확인 결과 샘플.

### P2. 기술·정책

**3-7. 광고 코드 노출 방식**
- 광고 스크립트는 `AdSlot`이 렌더될 때만 로드된다. 게재 플래그가 꺼진 지금은 사이트에 애드센스 코드가 없다. 소유권 확인은 `google-adsense-account` 메타(존재함)로 가능하나, 신청 시 코드 방식을 요구받으면 대응이 필요하다.
- 신청 시점에는 `NEXT_PUBLIC_ADSENSE_SERVING_ENABLED`를 켜지 않아도 되는지 AdSense 콘솔의 사이트 확인 방식으로 먼저 확인할 것.

**3-8. 제3자 배너와 광고 정책 충돌**
- `CoupangAffiliateBanner`는 외부 대시보드(`multi-dashboard-one.vercel.app`) 이미지·스크립트를 사이트 전체에 삽입하고, 모든 비제외 경로에서 노출될 수 있다. 애드센스와 병행하면 "광고가 본문보다 많은 화면"과 우발 클릭 위험이 생긴다.
- 신청 심사 기간에는 `NEXT_PUBLIC_AFFILIATE_ADS_ENABLED=false`를 권장한다. 승인 후 위치·밀도를 실험한다.
- HANDOFF에 기록된 "광고 403, 제휴 텔레메트리 CORS 오류"는 원인이 확인되지 않았다. 외부 스크립트 오류가 심사 크롤링에서 노출되지 않도록 먼저 해결할 것.

**3-9. robots.txt**
- `/*?` 전체 차단은 크롤링 비용 때문에 의도된 설정이다. 광고 크롤러(Mediapartners-Google)는 `*` 규칙을 따라 광고 페이지 접근에 문제가 없으나, 쿼리스트링이 붙는 광고 페이지가 있다면 확인이 필요하다.
- 승인 전에는 AI 크롤러를 별도 규칙으로 허용한 상태라 정책 측면의 문제는 없다.

**3-10. 문서 위생**
- 저장소 루트에 `build.log`, `build_final*.log`가 있다. 승인과 무관하나 정리를 권한다.
- `docs/HANDOFF.md`가 "리뷰 제출 권한 없음"을 명시하고 있으므로 신청 시점은 사용자가 직접 결정한다.

## 4. 신청 전 체크리스트

- [ ] 문의·개인정보 책임자 메일을 실제 수신 가능한 도메인 메일로 통일
- [ ] 운영자 실명·소개·편집 정책 공개
- [ ] 의료성 글 감수자 표기 또는 해당 글 비색인
- [ ] 중복 블로그 글 통합 및 301
- [ ] 약국 상세 페이지 색인 기준 강화 검토
- [ ] 제휴 배너 비활성화 후 신청
- [ ] GA4·GSC에서 색인된 페이지 수, 유입 국가, 봇 트래픽 이상 여부 확인
- [ ] 모바일 CWV(LCP<2.5s, INP<200ms, CLS<0.1) 실측
- [ ] 위 항목 반영 후 Search Console 재크롤링 요청, 이후 신청

## 5. 확인이 필요한 정보

1. 실제 운영 중인 문의 메일 주소 (todaypharm.kr 또는 todayyakuk.com)
2. 약사 감수 가능 여부
3. 현재 Search Console의 색인 페이지 수와 최근 28일 유입
4. 쿠팡 파트너스를 승인 전에 끌지 여부
