# 배포 환경 설정 가이드

## 환경 개요

- **호스팅**: Vercel
- **데이터베이스**: Supabase
- **크론 작업**: GitHub Actions

## 1. Vercel 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

### 필수 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# 사이트 URL
NEXT_PUBLIC_SITE_URL=https://today-yakuk.vercel.app

# Google Analytics (선택)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# 검색 엔진 검증 (선택)
NEXT_PUBLIC_GOOGLE_VERIFICATION=your_verification_code
NEXT_PUBLIC_NAVER_VERIFICATION=your_verification_code

# 공공데이터 API (약국 동기화용)
PUBLIC_DATA_API_KEY=your_public_data_api_key
```

### 설정 방법

1. Vercel 대시보드 접속
2. 프로젝트 선택 → Settings → Environment Variables
3. 위 환경 변수들을 추가
4. 각 환경(Production, Preview, Development)에 적용

## 2. GitHub Secrets 설정

GitHub Actions 크론 작업을 위해 다음 Secrets를 설정하세요:

### 필수 Secrets

1. **SUPABASE_URL**: Supabase 프로젝트 URL
2. **NEXT_PUBLIC_SUPABASE_URL**: Supabase 공개 URL (위와 동일)
3. **SUPABASE_SERVICE_ROLE_KEY**: Supabase Service Role Key
4. **GEMINI_API_KEY**: Gemini API 키
5. **NEXT_PUBLIC_SITE_URL**: 배포된 사이트 URL
6. **PUBLIC_DATA_API_KEY**: 공공데이터포털 API 키

### 설정 방법

1. GitHub 저장소 접속
2. Settings → Secrets and variables → Actions
3. New repository secret 클릭
4. 각 Secret 추가

## 3. 크론 작업 스케줄

### 현재 설정된 크론 작업

#### 1. 약국 데이터 동기화 (`daily-sync.yml`)
- **스케줄**: 매일 04:00 KST (19:00 UTC)
- **작업**: 공공데이터포털에서 약국 정보 동기화

#### 2. 컨텐츠 발행 (`scheduled-publish.yml`)
- **스케줄**: 하루 5회 (00:00, 04:00, 08:00, 12:00, 16:00 UTC)
- **작업**: `content_queue` 테이블의 pending 항목 발행
- **제한**: 한 번에 최대 2건

#### 3. 약국 컨텐츠 생성 (`generate-content.yml`)
- **스케줄**: 하루 2회 (02:00, 14:00 UTC = KST 11:00, 23:00)
- **작업**: Gemini API로 약국별 고유 컨텐츠 생성
- **제한**: 한 번에 최대 10건
- **총량**: 하루 최대 20건 생성

### 스케줄 조정

`.github/workflows/` 디렉토리의 YAML 파일에서 `cron` 값을 수정하여 조정할 수 있습니다.

**Cron 표현식 형식**:
```
분 시 일 월 요일
0  2  *  *  *  → 매일 02:00 UTC
```

**UTC → KST 변환**: UTC + 9시간 = KST

## 4. 로컬 개발 환경 설정

### `.env.local` 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# 사이트 URL (로컬 개발)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 공공데이터 API
PUBLIC_DATA_API_KEY=your_public_data_api_key
```

### 로컬에서 스크립트 실행

```bash
# 약국 데이터 동기화
npm run sync

# 컨텐츠 발행
npm run publish:queue

# 약국 컨텐츠 생성 (10건)
npm run generate:content

# 약국 컨텐츠 생성 (20건)
npm run generate:content 20
```

## 5. Supabase 데이터베이스 설정

### 필수 테이블

1. **pharmacies**: 약국 정보 테이블
2. **content_queue**: 컨텐츠 발행 큐 테이블

### 테이블 생성

`supabase/` 디렉토리의 SQL 파일을 Supabase SQL Editor에서 실행:

```sql
-- pharmacies 테이블
-- supabase/pharmacies.sql 실행

-- content_queue 테이블
-- supabase/content_queue.sql 실행
```

## 6. 배포 워크플로우

### 자동 배포 (Vercel)

1. GitHub에 push하면 자동으로 Vercel에 배포
2. `main` 브랜치 → Production
3. 다른 브랜치 → Preview

### 수동 배포

```bash
# 빌드 테스트
npm run build

# Vercel CLI로 배포
vercel --prod
```

## 7. 모니터링 및 로그

### Vercel 로그

- Vercel 대시보드 → 프로젝트 → Logs
- 실시간 로그 확인 가능

### GitHub Actions 로그

- GitHub 저장소 → Actions 탭
- 각 워크플로우 실행 결과 확인

### Supabase 로그

- Supabase 대시보드 → Logs
- 데이터베이스 쿼리 및 에러 확인

## 8. 문제 해결

### 환경 변수 오류

**증상**: `GEMINI_API_KEY가 설정되지 않았습니다.`

**해결**:
1. Vercel 환경 변수 확인
2. GitHub Secrets 확인
3. `.env.local` 파일 확인 (로컬 개발 시)

### 크론 작업 실패

**증상**: GitHub Actions에서 스크립트 실행 실패

**해결**:
1. Actions 탭에서 로그 확인
2. Secrets 설정 확인
3. 스크립트 문법 오류 확인

### API Rate Limit

**증상**: Gemini API 호출 제한

**해결**:
1. `generate-pharmacy-content.ts`의 딜레이 조정
2. 배치 크기 줄이기 (limit 값 감소)
3. 크론 스케줄 간격 늘리기

## 9. 비용 관리

### Gemini API

- 무료 티어: 월 60회 요청
- 유료 플랜: 사용량에 따라 과금
- **권장**: 하루 20건 생성 시 월 약 600건 → 유료 플랜 필요

### Vercel

- 무료 플랜: 제한적
- Pro 플랜: 월 $20

### Supabase

- 무료 플랜: 제한적
- Pro 플랜: 월 $25

## 10. 보안 주의사항

⚠️ **절대 공개하지 마세요**:
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `PUBLIC_DATA_API_KEY`

✅ **안전하게 공개 가능**:
- `NEXT_PUBLIC_SUPABASE_URL` (공개 URL)
- `NEXT_PUBLIC_SITE_URL`

## 참고 자료

- [Vercel 환경 변수 문서](https://vercel.com/docs/concepts/projects/environment-variables)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Supabase 문서](https://supabase.com/docs)
- [Gemini API 문서](https://ai.google.dev/docs)

