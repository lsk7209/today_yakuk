# GitHub Actions 워크플로우 현황

**작성일**: 2024년

---

## 📋 현재 워크플로우 목록

### 1. 콘텐츠 생성 (AI 재생성) ❌ 자동 실행 안 됨

**파일**: `.github/workflows/generate-content.yml`

- **실행 방식**: 수동만 가능 (`workflow_dispatch`)
- **설명**: Gemini API를 사용한 콘텐츠 생성
- **상태**: 자동 스케줄 없음 (의도적으로 중단됨)
- **주석**: "Gemini 기반 대량 생성은 중단합니다. 필요 시에만 수동 실행하세요."

**수동 실행 방법**:
1. GitHub 저장소 → Actions 탭
2. "Generate Pharmacy Content" 워크플로우 선택
3. "Run workflow" 클릭
4. 생성할 개수 입력 (기본값: 6)

---

### 2. 콘텐츠 발행 ⚠️ 중복 실행 중

#### 2-1. `scheduled-publish.yml` (기존)
- **실행 주기**: 2시간마다 (`cron: "0 */2 * * *"`)
- **발행 개수**: 1건씩
- **하루 총 발행량**: 약 12건
- **상태**: ✅ 자동 실행 중

#### 2-2. `publish-content.yml` (신규 생성)
- **실행 주기**: 하루 5회 (한국 시간 02:00, 06:00, 10:00, 14:00, 18:00)
- **발행 개수**: 2건씩
- **하루 총 발행량**: 10건
- **상태**: ✅ 자동 실행 중

**⚠️ 문제점**: 두 워크플로우가 동시에 실행되어 하루 최대 22건까지 발행될 수 있음

---

### 3. 데이터 동기화 ✅ 자동 실행 중

**파일**: `.github/workflows/daily-sync.yml`

- **실행 주기**: 매일 04:00 KST (19:00 UTC)
- **기능**: 공공데이터 API에서 약국 정보 동기화
- **상태**: ✅ 자동 실행 중

---

## 🔧 권장 조치 사항

### 옵션 1: `scheduled-publish.yml` 비활성화 (권장)

`publish-content.yml`만 사용하고 `scheduled-publish.yml`은 비활성화:

```yaml
# scheduled-publish.yml 파일에서 schedule 제거
on:
  # schedule:  # 주석 처리
  #   - cron: "0 */2 * * *"
  workflow_dispatch:  # 수동 실행만 가능
```

**장점**:
- 발행 일정이 명확함 (하루 5회, 고정 시간)
- 하루 최대 10건으로 제어 가능
- 중복 실행 방지

### 옵션 2: `publish-content.yml` 비활성화

기존 `scheduled-publish.yml`만 사용:

```yaml
# publish-content.yml 파일에서 schedule 제거
on:
  # schedule:  # 주석 처리
  #   ...
  workflow_dispatch:  # 수동 실행만 가능
```

**장점**:
- 기존 설정 유지
- 2시간마다 균등 분산

### 옵션 3: 두 워크플로우 모두 유지

현재 상태 유지 (하루 최대 22건 발행 가능)

**단점**:
- 예상보다 많은 콘텐츠 발행
- 리소스 사용 증가

---

## 📊 현재 자동 실행 현황 요약

| 워크플로우 | 자동 실행 | 실행 주기 | 기능 |
|-----------|---------|----------|------|
| `generate-content.yml` | ❌ | 수동만 | AI 콘텐츠 생성 |
| `scheduled-publish.yml` | ✅ | 2시간마다 | 콘텐츠 발행 (1건) |
| `publish-content.yml` | ✅ | 하루 5회 | 콘텐츠 발행 (2건) |
| `daily-sync.yml` | ✅ | 매일 04:00 | 데이터 동기화 |

---

## ✅ 확인 방법

1. **GitHub Actions 실행 확인**:
   - GitHub 저장소 → Actions 탭
   - 각 워크플로우의 실행 이력 확인
   - 최근 실행 시간 및 상태 확인

2. **발행된 콘텐츠 확인**:
   - Supabase Dashboard → `content_queue` 테이블
   - `status = 'published'` 필터
   - `published_at` 날짜 확인

---

## 🎯 다음 단계

1. **중복 워크플로우 정리** (옵션 1 권장)
2. **GitHub Actions 실행 이력 확인**
3. **발행량 모니터링**

---

**참고**: 
- `publish-queue.ts` 스크립트는 "AI 재생성 중단: 이미 생성된 콘텐츠만 발행합니다"라고 명시되어 있음
- 실제 콘텐츠 생성은 수동으로만 실행 가능

