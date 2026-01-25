# GitHub Secrets 설정 가이드

## ⚠️ 중요: SUPABASE_SERVICE_ROLE_KEY 추가 필요

현재 GitHub Secrets에 **`SUPABASE_SERVICE_ROLE_KEY`가 없습니다**. 이 키가 없으면 데이터베이스에 쓰기 작업을 할 수 없습니다.

## 현재 GitHub Secrets 상태

✅ 있는 변수:
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `PUBLIC_DATA_API_KEY`

🟡 선택(필요할 때만):
- `GEMINI_API_KEY` (수동 컨텐츠 생성 워크플로우용)

❌ 없는 변수 (필수):
- `SUPABASE_SERVICE_ROLE_KEY` ← **이것을 추가해야 합니다!**

## SUPABASE_SERVICE_ROLE_KEY 추가 방법

### 1. Supabase 대시보드에서 키 확인

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. **Settings** → **API** 메뉴
4. **Project API keys** 섹션에서:
   - **`service_role`** 키 찾기 (⚠️ 주의: `anon` 키가 아님!)
   - **`service_role`** 키 복사

### 2. GitHub Secrets에 추가

1. GitHub 저장소로 이동
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret** 클릭
4. 다음 정보 입력:
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Secret**: Supabase에서 복사한 `service_role` 키
5. **Add secret** 클릭

## ⚠️ 보안 주의사항

- `service_role` 키는 **모든 권한**을 가집니다
- 절대 공개 저장소에 커밋하지 마세요
- GitHub Secrets에만 저장하세요
- 필요시 키를 순환(rotate)하세요

## 워크플로우에서 사용하는 변수

업데이트된 워크플로우는 다음 변수를 사용합니다:

```yaml
env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}  # ← 추가 필요!
  NEXT_PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}
  SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}  # NEXT_PUBLIC_SUPABASE_URL과 동일
```

## 확인 방법

`SUPABASE_SERVICE_ROLE_KEY`를 추가한 후:

1. GitHub Actions에서 워크플로우 실행
2. 로그에서 다음 오류가 없어야 합니다:
   - ❌ "Supabase 환경 변수가 설정되지 않았습니다"
   - ❌ "SUPABASE_SERVICE_ROLE_KEY가 필요합니다"

## 참고

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 읽기 전용 (공개 키)
- `SUPABASE_SERVICE_ROLE_KEY`: 읽기/쓰기 모두 가능 (비공개 키, 서버에서만 사용)

