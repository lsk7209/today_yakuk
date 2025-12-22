# 개발 현황 및 진행 계획

**작성일**: 2024년  
**프로젝트**: 오늘약국 (TodayPharmacy)

---

## 📊 현재 상태 요약

### ✅ 완료된 항목

1. **의존성 관리**
   - ✅ `zod` 패키지 설치 완료 (v3.22.4)
   - ✅ 모든 필수 패키지 설치됨

2. **핵심 기능**
   - ✅ 사이트맵 인덱스 확장 (10k 청크 단위)
   - ✅ 페이지네이션 노출 (50개/페이지)
   - ✅ 내부링크/AEO 유지
   - ✅ 인덱싱 기준 로직 구현 (`pharmacy-indexability.ts`)
   - ✅ 인덱싱 대상 점검 SQL (`indexability_audit.sql`)

3. **데이터 관리**
   - ✅ Supabase 연동
   - ✅ 데이터 동기화 스크립트
   - ✅ 배치 처리 최적화

4. **SEO/AEO**
   - ✅ 동적 메타데이터 생성
   - ✅ JSON-LD 구조화 데이터
   - ✅ Sitemap 자동 생성

---

## 🔴 긴급 수정 필요 (Critical)

### 1. 코드 중복 제거: `distanceKm` 함수

**문제**: `distanceKm` 함수가 여러 파일에 중복 정의됨
- `src/lib/data/pharmacies.ts` (export됨)
- `src/app/pharmacy/[id]/page.tsx` (로컬 함수)

**해결 방법**:
- `page.tsx`에서 로컬 `distanceKm` 함수 제거
- `@/lib/data/pharmacies`에서 import하여 사용

**영향 파일**:
- `src/app/pharmacy/[id]/page.tsx` (라인 786-814)

---

## 🟡 중요 개선 사항 (High Priority)

### 2. `getAllPharmacyHpids` 함수 개선

**현재 상태**: 
- 제한 없이 전체 조회 시도
- Supabase 기본 제한(1000건) 또는 메모리 문제 가능성

**권장 개선**:
- 이미 `getPharmacyHpidsChunk` 함수가 있으므로 이를 활용
- 또는 페이지네이션으로 처리

**영향 파일**:
- `src/lib/data/pharmacies.ts` (라인 127-147)

### 3. 발행 스케줄 시스템 자동화

**현재 상태**:
- ✅ `scripts/publish-queue.ts` 스크립트 존재
- ✅ `content_queue` 테이블 존재
- ❌ 자동 실행 스케줄러 없음

**필요 작업**:
- GitHub Actions 또는 Vercel Cron Job 설정
- 하루 최대 10건 자동 발행 (5회 × 2건)
- 발행 우선순위 로직 검토

**참고 파일**:
- `scripts/publish-queue.ts`
- `supabase/content_queue.sql`

---

## 🟢 개선 제안 (Medium Priority)

### 4. 타입 안정성 개선

**문제**: 일부 `any` 타입 사용
- FAQ 데이터 처리 시 타입 캐스팅

**권장**: 명확한 타입 정의 추가

### 5. 에러 핸들링 강화

**현재**: `console.error`만 사용
**권장**: 
- 사용자 친화적 에러 메시지
- 에러 바운더리 추가
- 에러 추적 시스템 (Sentry 등) 고려

### 6. 테스트 코드 작성

**현재**: 테스트 코드 없음
**권장**:
- 단위 테스트 (Jest/Vitest)
- 비즈니스 로직 테스트 (`hours.ts`, `pharmacy-indexability.ts`)
- 통합 테스트

---

## 📋 단계별 개발 계획

### Phase 1: 버그 수정 및 안정화 (즉시)

1. **코드 중복 제거**
   ```bash
   # distanceKm 함수 통합
   - src/app/pharmacy/[id]/page.tsx 수정
   ```

2. **데이터 조회 최적화**
   ```bash
   # getAllPharmacyHpids 개선 또는 사용처 확인
   - src/lib/data/pharmacies.ts 검토
   ```

### Phase 2: 발행 시스템 자동화 (1주 내)

1. **GitHub Actions Cron Job 설정**
   ```yaml
   # .github/workflows/publish-content.yml
   - 매일 5회 실행 (2건씩 발행)
   - 환경 변수 설정 확인
   ```

2. **발행 우선순위 로직**
   - `publish_at` 기준 정렬
   - 우선순위 점수 계산 (선택적)

### Phase 3: 기능 개선 (2-4주)

1. **검색 기능 강화**
   - 약국명 검색
   - 주소 기반 검색
   - 자동완성

2. **지도 통합**
   - 네이버/카카오 지도 API
   - 마커 클러스터링
   - 경로 안내

3. **콘텐츠 관리 대시보드**
   - 발행 상태 모니터링
   - 수동 발행/수정 기능

### Phase 4: 성능 및 모니터링 (1-2개월)

1. **성능 최적화**
   - 이미지 최적화
   - 코드 스플리팅
   - 캐싱 전략 (Redis)

2. **모니터링 도입**
   - Google Analytics (이미 설정됨)
   - 에러 추적 (Sentry)
   - 성능 모니터링 (Vercel Analytics)

3. **테스트 코드 작성**
   - 단위 테스트
   - 통합 테스트
   - E2E 테스트

---

## 🎯 우선순위별 작업 목록

### 🔥 긴급 (이번 주)
- [ ] `distanceKm` 함수 중복 제거
- [ ] `getAllPharmacyHpids` 사용처 확인 및 개선
- [ ] 발행 스케줄 시스템 자동화 (GitHub Actions)

### ⚡ 중요 (이번 달)
- [ ] 타입 안정성 개선
- [ ] 에러 핸들링 강화
- [ ] 코드 중복 제거 (기타)

### 📈 개선 (다음 분기)
- [ ] 테스트 코드 작성
- [ ] 검색 기능 추가
- [ ] 지도 통합
- [ ] 성능 모니터링 도입

---

## 📝 참고 문서

- `CODE_REVIEW.md` - 상세 코드 검토 보고서
- `PLAN.md` - 원본 구현 계획
- `IMPLEMENTATION_SUMMARY.md` - 구현 완료 요약
- `DEPLOYMENT_GUIDE.md` - 배포 가이드

---

## 🔍 현재 열려있는 파일

**`supabase/indexability_audit.sql`**
- 약국 상세 페이지 인덱싱(노출) 대상 점검 SQL
- 목적: "얇은 데이터" 페이지를 noindex+sitemap 제외하는 정책 확인
- 3가지 쿼리:
  1. 전체/인덱싱 가능/제외 대상 집계
  2. noindex 사유 분해
  3. noindex 대상 샘플 50개

**다음 단계**: 이 SQL을 실행하여 현재 인덱싱 상태를 확인하고, 필요시 정책 조정

---

## 💡 즉시 실행 가능한 작업

1. **인덱싱 상태 확인**
   ```sql
   -- Supabase SQL Editor에서 실행
   -- supabase/indexability_audit.sql 파일 내용 실행
   ```

2. **코드 중복 제거**
   - `src/app/pharmacy/[id]/page.tsx` 수정
   - `distanceKm` import로 변경

3. **발행 스케줄 설정**
   - GitHub Actions 워크플로우 생성
   - 또는 Vercel Cron Job 설정

---

**다음 검토 예정일**: 주요 변경사항 완료 후

