# GitHub Secrets 체크리스트

## ✅ 현재 설정된 Secrets

다음 Secrets가 GitHub에 설정되어 있습니다:

- ✅ `NEXT_PUBLIC_SITE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `PUBLIC_DATA_API_KEY`

## 🟡 선택 Secrets (필요할 때만)

- `GEMINI_API_KEY` (수동 컨텐츠 생성 워크플로우용)

## ❌ 추가 필요한 Secret

### `SUPABASE_SERVICE_ROLE_KEY` (필수)

**이 Secret이 없으면 데이터베이스에 쓰기 작업을 할 수 없습니다!**

#### 추가 방법:

1. **Supabase 대시보드 접속**
   - https://app.supabase.com
   - 프로젝트 선택

2. **API 키 확인**
   - Settings → **API** 메뉴
   - **Project API keys** 섹션
   - **`service_role`** 키 찾기
   - ⚠️ **`anon` 키가 아닌 `service_role` 키입니다!**

3. **GitHub에 추가**
   - GitHub 저장소 → **Settings**
   - **Secrets and variables** → **Actions**
   - **New repository secret** 클릭
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Secret: Supabase에서 복사한 `service_role` 키
   - **Add secret** 클릭

## 🔍 확인 방법

Secret을 추가한 후:

1. GitHub Actions에서 워크플로우 실행
2. 로그에서 다음 오류가 없어야 합니다:
   - ❌ "SUPABASE_SERVICE_ROLE_KEY가 필요합니다"
   - ❌ "Supabase 환경 변수가 설정되지 않았습니다"

## 📝 워크플로우에서 사용하는 변수

업데이트된 워크플로우는 다음 변수를 사용합니다:

```yaml
env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}  # ✅ 있음
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}  # ✅ 있음
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}  # ❌ 추가 필요!
  NEXT_PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}  # ✅ 있음
  SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}  # NEXT_PUBLIC_SUPABASE_URL과 동일
```

## ⚠️ 보안 주의사항

- `service_role` 키는 **모든 권한**을 가집니다
- 절대 공개 저장소에 커밋하지 마세요
- GitHub Secrets에만 저장하세요
- 필요시 키를 순환(rotate)하세요

