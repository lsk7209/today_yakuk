# RISKS

| Risk | Impact | Likelihood | Mitigation | Trigger | Status |
|---|---|---|---|---|---|
| Vulnerable `fast-xml-parser@5.3.4` consumes public API XML | critical parser flaws may enable DoS or unsafe entity handling during sync | medium | upgraded to 5.11.1 and added compatibility proof | running pharmacy sync on external XML | resolved |
| Public getter includes `pending` content | unreviewed AI/draft copy is exposed on pharmacy pages | high | public query requires `published`; pending-only fixture added | pending content linked to a pharmacy | resolved |
| Admin update dynamically interpolates request object keys into SQL | authenticated malformed request can change unintended columns or inject SQL syntax | medium | strict route schema plus data-layer column allowlist | admin queue PUT request | resolved |
| AI/DB text is inserted via `dangerouslySetInnerHTML` after regex highlighting | stored HTML in description/FAQ/extra section can execute in users' browsers | medium | escape-first highlights, allowlist HTML sanitizer and safe JSON-LD serialization | compromised or malformed DB/generated content | resolved |
| E2E suite has 5 failures | CI cannot reliably prove navigation/wiki behavior | high | fixed navigation waits, exact locators and hydration ordering | any E2E run | resolved |
| Login throttling is process-local and trusts forwarded headers | attackers can evade limits across instances or spoofed IP values | medium | rate limit in trusted shared storage and normalize only platform-trusted client IP | public admin login | open |
| Scheduled generation and publishing perform external writes frequently | unexpected cost/content churn if secrets and workflows remain enabled | medium | explicit budgets, concurrency/idempotency, monitoring and documented schedules | scheduled GitHub Actions | open |
| HFF sync overwrites derived enrichment columns | curated/generated supplement data can be lost each sync | high | source-only upsert with conflict regression tests | scheduled HFF sync | resolved |
| Documentation/test source contains encoding residue and stale bootstrap text | maintenance and onboarding errors | high | normalize UTF-8 and replace generic README with actual setup/run/architecture notes | developer onboarding | open |

| Risk | Impact | Likelihood | Mitigation | Status |
|---|---|---|---|---|

## Risk Notices

### 2026-08-27 local remediation

- Task: dependency and security-sensitive code remediation
- Why Needed: confirmed critical dependency, stored-XSS, dynamic SQL-field, draft exposure, and data ownership risks
- Impact Scope: local source, tests, workflows, package lock; no production data or external settings
- Rollback: revert the explicit local diff before any future commit
- Safer Alternative: documentation-only deferral was rejected because the user authorized implementation
- Approval Needed: no for local reversible edits; yes for any later production migration, external API write, deployment, or push

## Residual MEDIUM risks accepted for this scope

- Admin login throttling is process-local and depends on deployment-proxy IP headers; distributed storage was an explicit non-goal.
- Nearby SQL limits 400 unordered bounding-box candidates before exact sorting, so extremely dense areas can omit a nearer result.
- Publishing lacks a workflow concurrency group/atomic claim and does not persist failed IndexNow/GSC notifications for retry.
- Missing Turso configuration returns an empty dummy client; this is useful for local build/E2E but can mask production misconfiguration.
- ESLint 9.39.5 is upstream-unsupported; ESLint 10 was tested and is currently incompatible with React plugins bundled by Next 16.3.3. Audit remains 0.

### 2026-08-27 read-only production data inspection

- Task: 기존 Turso 자격증명을 이용한 데이터 최신성·미보강 현황 확인
- Why Needed: 사용자가 신규 수집 API 데이터 확인과 후속 콘텐츠 작업 진행을 명시적으로 승인함
- Impact Scope: 환경변수 존재 여부 확인 및 `PRAGMA`/`SELECT` 읽기 쿼리만 실행
- Rollback: 읽기 작업이므로 데이터 롤백 불필요; 생성되는 로컬 보고서/초안은 Git diff로 되돌릴 수 있음
- Safer Alternative: 로컬 스키마만 추정할 수 있으나 실제 신규 데이터 여부를 증명할 수 없어 선택하지 않음
- Approval Needed: 읽기 전용 확인은 사용자의 `진행하자`로 승인됨; DB 쓰기·발행·워크플로 실행은 별도 승인 필요
- Secret Handling: `.env.local` 값은 로그·문서·채팅에 출력하지 않음

### Data-to-content residual boundaries

- 현재 운영 DB의 직접 `SELECT` 스냅샷은 자격증명 부재로 실행하지 않았다. Actions 로그의 pre-sync table count와 공개 sitemap/listing을 서로 구분해 기록했다.
- supplement/medicine sitemap `lastmod`는 이 저장소 구현상 DB `created_at`이며 규제기관의 신규 허가·신고일 또는 출시일이 아니다.
- 약국 전체 sync는 모든 행의 `updated_at`을 만질 수 있어 25,291→25,295 원천 응답 차이로 신규 개업 약국을 식별할 수 없다.
- 2026-08-27 원격 auto-enrichment는 누락 영양정보 후보 15개를 모두 실패했지만 기존 원격 스크립트가 성공 종료했다. 로컬 수리는 아직 push되지 않아 원격 동작은 변하지 않았다.
- 새 데이터 글은 실제 발행 시각이 없는 `noindex,nofollow` 로컬 초안이며 blog registry와 sitemap에서 제외했다. 발행 승인 시 `publishedAt`을 새로 기록하고 재검증해야 한다.
- 공개 발행 콘텐츠 712개의 제목/slug 중복은 확인했지만 본문 의료 품질 전체를 재감사하지는 않았다. 로컬 campaign 306행도 여전히 템플릿 반복과 내부 링크 부족이라는 콘텐츠 부채가 있다.
- `content/data-audits/2026-08-27.json`은 시점 고정 증거다. 후속 게시나 데이터 업데이트 전에는 같은 read-only 명령으로 재생성해야 한다.

### 2026-08-28 Search/CRO risks and boundaries

- 라이브 sitemap index와 다수 정적 URL이 요청 시각을 `lastmod`로 사용해 검증 불가능한 freshness 신호를 만든다. 실제 변경일만 사용하거나 알 수 없는 값은 생략한다.
- WebSite `SearchAction`은 `/wiki?q=`를 선언하지만 서버 페이지가 해당 query를 소비하지 않으며 Google sitelinks search box도 지원 종료됐다. WebSite 식별 schema는 보존하고 action만 제거한다.
- 영업 상태는 등록 운영시간으로 계산되므로 `실시간 영업 정보`, `안심하고 방문` 표현은 실제 현장 상태 보장으로 오해될 수 있다. 방문 전 전화 확인을 핵심 행동으로 전환한다.
- GA4 동작은 로컬 dataLayer/gtag 전달까지만 증명할 수 있다. GA property의 key-event 지정, 보고서 반영, 실제 통화·방문·구매는 외부 계정/현장 검증 범위 밖이다.
- analytics에는 건강/제품 검색어, 전화번호, 좌표를 보내지 않는다. `pharmacy_id`, 표면, 상태, 순위, 결과 개수 bucket처럼 최소한의 제품 상호작용만 보낸다.
- 공개 PageSpeed API는 429 quota exhaustion으로 기준 점수를 반환하지 않았다. 이를 성능 통과로 해석하지 않고 로컬 브라우저/빌드 검증과 별도 경계로 기록한다.

#### Final disposition

- 요청 시각 lastmod와 빌드 시점 데이터 동결은 runtime sitemap routes와 명시적 변경일로 해소했다. DB 자격증명이 없는 로컬에서 데이터 child sitemap이 404인 것은 의도된 fail-closed 경계이며, 실제 운영 DB 목록은 향후 배포 후 재검증해야 한다.
- 라이브 지역 페이지에서 관찰한 RSC 오류의 로컬 원인은 서버 전용 데이터 모듈에 있던 거리 계산 import였고 순수 모듈로 분리했다. 로컬 production smoke에는 오류가 없지만 현재 라이브는 아직 변경 전 코드이므로 해결됐다고 단정하지 않는다.
- analytics API는 strict JSON, exact same-origin, query/hash 제거, referrer 축소 및 process-local rate limit을 적용했다. 분산 인스턴스 공용 rate limit은 남은 MEDIUM 운영 과제다.
- 핵심 전환은 실제 통화·방문·구매가 아니라 `전화/길찾기 의도`다. GA4 property의 key event 지정과 실데이터 수신은 외부 계정 단계에서 별도 확인해야 한다.
- Naver verification/Yeti/sitelinks 파일은 존재하지만 Search Advisor 지표 증거가 없어 `neo: evidence_missing`으로 유지한다. `entity_present: true`는 사이트명·canonical·Organization schema의 로컬 존재만 뜻한다.
- 검색 순위나 트래픽 상승은 보장하지 않는다. 배포가 별도 승인될 경우 2026-09-11에 대표 질의 노출/클릭/CTR과 contact/directions intent를 재측정한다.

### 2026-08-28 API delta/content read-only refresh

- Task: 2026-08-27 스냅샷 이후 공개 데이터·수집 실행 변화 확인과 로컬 콘텐츠 전환.
- Impact Scope: 공개 sitemap/Actions 로그 읽기, 로컬 manifest·초안·테스트·하네스 파일만 변경 가능.
- Secret Handling: 환경변수는 존재 여부만 확인하고 값은 출력하지 않는다. 로컬 `.env.local`은 없다.
- Main Risk: 라이브 `lastmod`가 사이트 레코드 생성일 또는 템플릿 변경일일 수 있으므로 신규 허가·출시·개업으로 해석하지 않는다.
- Approval Boundary: 읽기 전용 조사와 로컬 noindex 초안은 승인됨. DB/API 쓰기, workflow 실행, 발행, Git push, 배포는 별도 승인 필요.
- Rollback: 새 로컬 artifact와 문서 diff는 파일 단위로 되돌릴 수 있다.

#### Final residual boundaries

- 운영 DB를 직접 조회하지 않았으므로 공개 sitemap과 Actions 로그 밖의 내부 필드 변경은 확인하지 못했다. 정부 API도 로컬 자격증명 없이 호출하지 않았고, 공개 로그·sitemap·공식 문서만 읽었다.
- 출처 표식이 없는 legacy `nutrition_facts`는 재검증 전까지 상세·비교·sitemap 신호에서 의도적으로 숨긴다. 이는 허위 노출을 막지만 authoritative re-enrichment가 끝날 때까지 일부 실제 성분도 비어 보일 수 있다.
- no-data 시도 상태를 DB에 별도로 기록하지 않는다. run-number 기반 cursor rotation은 첫 15행 고착을 막지만, 데이터가 없는 행의 재시도가 향후 API 호출을 소비할 수 있는 MEDIUM 운영 비용은 남는다.
- 새 라벨 가이드와 월간 데이터 초안은 로컬 `noindex,nofollow` 상태이며 blog 목록·sitemap에서 제외된다. 따라서 현재 라이브 검색 유입이나 전환 수치에는 아직 영향을 주지 않는다.
- 0-delta는 관측 기간과 공개 경로에 대한 결론일 뿐 신규 허가·출시·개업이 전혀 없었다는 의미가 아니다. 검색 순위·트래픽·전환 상승도 보장하지 않는다.

### 2026-08-28 Scheduled-content residual boundaries

- Actions 로그는 `2026-09-21 21:00 KST` 예약 insert 사건을 증명하지만 이후 관리자 수정·삭제나 현재 `status`를 증명하지 않는다. 운영 DB 자격증명이 없어 직접 `SELECT`하지 않았다.
- `2026-09-22 09:00 KST`는 저장소 scheduler가 계산한 다음 후보 슬롯일 뿐 예약되지 않았다. 원격 generator가 다시 실행되면 먼저 차지할 수 있다.
- `generate-blog.yml` cron 제거는 로컬 변경이다. 별도 승인된 Git push 전까지 GitHub의 원격 자동 생성에는 영향이 없다.
- 기존 pending queue와 `publish-content.yml`은 의도적으로 유지했다. 따라서 이미 예약된 외부 생성 글은 예정 시각이 되면 계속 공개될 수 있고, 8월 계절성 제목이 9월 21일에 예약된 콘텐츠 적합성 부채도 남는다.
- 신규 첨가물 가이드는 로컬 `noindex,nofollow`이며 blog 목록·sitemap에 없다. 현재 라이브 검색 유입이나 전환에는 영향이 없고 다음 슬롯도 실제로 점유하지 않았다.
- 제품 상세에서 가이드 링크를 추가했으므로 향후 push/deploy 시 noindex 페이지가 사용자와 crawler에게 발견될 수 있다. 공개 전 editorial 검수와 실제 발행일·indexing·registry/sitemap 전환이 필요하다.

### 2026-08-28 GitHub publication risk notice

- Task: 검증 완료된 TodayPharm 로컬 변경을 단일 commit으로 `origin/main`에 push.
- Why Needed: 사용자가 `깃배포해`라고 명시적으로 GitHub 반영을 승인함.
- Impact Scope: 현재 기준 `82f4e4468bf8553e919fe653825381c1d65289e0` 위의 allowlisted source, workflow, content, test, harness files만 Git history와 GitHub `main`에 추가. 운영 DB/API와 Vercel은 변경하지 않음.
- Rollback: push 후 문제가 확인되면 새 commit을 강제 삭제하지 않고 별도 revert commit으로 복구할 수 있음. 자동 생성 workflow schedule 제거도 동일하게 revert 가능.
- Safer Alternative: local commit만 만들고 push를 보류할 수 있으나 사용자가 이번 turn에 GitHub 반영을 직접 요청해 선택하지 않음.
- Approval Needed: GitHub push는 현재 사용자 메시지로 승인됨. Vercel, 실제 DB 예약·발행, workflow dispatch는 승인되지 않았으므로 금지.
- Secret Handling: `.env*`, credential, token, runtime artifact는 stage하지 않으며 cached content scan은 값 대신 의심 경로만 보고함.
## 2026-08-28 completion follow-up residual risks

| Risk | Impact | Likelihood | Mitigation | Status |
|---|---|---|---|---|
| Published status and search notification are not backed by a durable outbox | transient notification failure can require manual re-notification | medium | design an outbox/notification state and migration before changing production schema | accepted follow-up; no production migration authorized |
| New CI has not run on GitHub | Linux/Actions behavior is not yet proven | medium | commit/push only on explicit request, then inspect both CI jobs at the pushed SHA | external boundary |
| Production DB-backed routes remain unverified | local empty-DB proof cannot confirm live rows | medium | run separate credentialed SELECT-only verification | external boundary |
## Risk Notice - automated ingestion reliability

Task: Add collection run evidence, missed-run monitoring, site verification, and indexing retry controls; publish validated code to GitHub.
Why Needed: Scheduled workflow success alone does not prove API fetch, DB write, or public-site reflection.
Impact Scope: GitHub Actions schedules and future Turso schema initialization after the pushed workflow runs.
Rollback: Revert the Git commit; new additive tables can remain unused or be removed only in a separately approved migration.
Safer Alternative: Local-only logging without durable DB evidence, rejected because it cannot detect missed or partial runs.
Approval Needed: User explicitly requested Goal Harness, multi-agent execution, improvements, and GitHub completion. No manual production DB write or Vercel mutation will be performed.
