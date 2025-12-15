# 🚀 Vercel에서 약국 컨텐츠 생성 빠른 시작

## 가장 빠른 방법: GitHub Actions 사용

### 1단계: GitHub Secrets 확인 및 추가

GitHub 저장소 → Settings → Secrets and variables → Actions에서 확인:

**✅ 현재 있는 변수:**
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `PUBLIC_DATA_API_KEY`

**❌ 추가 필요한 변수:**
- `SUPABASE_SERVICE_ROLE_KEY` ← **이것을 추가해야 합니다!**

#### SUPABASE_SERVICE_ROLE_KEY 추가 방법:

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택 → **Settings** → **API**
3. **Project API keys** 섹션에서 **`service_role`** 키 복사
   - ⚠️ 주의: `anon` 키가 아닌 **`service_role`** 키입니다!
4. GitHub → Settings → Secrets → **New repository secret**
5. Name: `SUPABASE_SERVICE_ROLE_KEY`, Value: 복사한 키 입력
6. **Add secret** 클릭

### 2단계: 워크플로우 실행

1. **GitHub 저장소로 이동**
   ```
   https://github.com/[your-username]/[your-repo]
   ```

2. **Actions 탭 클릭**

3. **"Generate Single Pharmacy Content" 선택**

4. **"Run workflow" 버튼 클릭**

5. **HPID 입력**
   ```
   C1109587
   ```

6. **"Run workflow" 실행**

### 3단계: 결과 확인

- Actions 탭에서 실행 상태 확인
- 초록색 체크 표시 = 성공 ✅
- 빨간색 X 표시 = 실패 ❌ (로그 확인)

## 실행 예시

```
✅ 약국 정보를 찾을 수 없습니다: C1109587
✨ [CREATE] 100세건강약국 (C1109587): 새로운 요약 생성
약국명: 100세건강약국
주소: 서울특별시 강남구 헌릉로571길 7, 강남레체 1층 101호 (세곡동)
Gemini API로 요약 생성 중...
✅ [SUCCESS] 100세건강약국 (C1109587): 요약 저장 완료
```

## 문제 해결

### ❌ "GEMINI_API_KEY가 설정되지 않았습니다"
→ GitHub Secrets에 `GEMINI_API_KEY`가 설정되어 있는지 확인

### ❌ "Supabase 환경 변수가 설정되지 않았습니다"
→ GitHub Secrets에 Supabase 관련 변수가 설정되어 있는지 확인

### ❌ "약국 정보를 찾을 수 없습니다"
→ Supabase에 해당 HPID의 약국 데이터가 있는지 확인

## 다음 단계

생성된 컨텐츠는 다음 위치에서 확인할 수 있습니다:

1. **Supabase 대시보드**
   - `pharmacies` 테이블 → `gemini_summary` 컬럼

2. **웹사이트**
   - https://www.todaypharm.kr/pharmacy/C1109587
   - 페이지 상단에 AI 생성 요약이 표시됩니다.

