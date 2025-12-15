# Vercel 환경에서 약국 컨텐츠 생성 가이드

## 방법 1: GitHub Actions를 통한 실행 (권장)

### 1. GitHub Secrets 설정

GitHub 저장소의 Settings → Secrets and variables → Actions에서 다음 secrets를 추가하세요:

- `SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL (공개)
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key
- `GEMINI_API_KEY`: Google Gemini API Key
- `NEXT_PUBLIC_SITE_URL`: 사이트 URL (예: https://todaypharm.kr)

### 2. 워크플로우 실행

1. GitHub 저장소로 이동
2. **Actions** 탭 클릭
3. **Generate Single Pharmacy Content** 워크플로우 선택
4. **Run workflow** 버튼 클릭
5. HPID 입력 (예: `C1109587`)
6. **Run workflow** 실행

### 3. 실행 확인

- Actions 탭에서 실행 상태 확인
- 로그에서 성공/실패 여부 확인

## 방법 2: Vercel CLI를 사용한 로컬 실행

### 1. Vercel CLI 설치

```bash
npm install -g vercel
```

### 2. Vercel 로그인

```bash
vercel login
```

### 3. 프로젝트 링크

```bash
vercel link
```

### 4. 환경 변수 가져오기

```bash
# Vercel에서 환경 변수 가져오기
vercel env pull .env.local
```

### 5. 스크립트 실행

```bash
npm run generate:single C1109587
npm run generate:summary C1109587
```

## 방법 3: Vercel Serverless Function로 API 엔드포인트 생성

### 1. API 엔드포인트 생성

`src/app/api/generate-pharmacy/route.ts` 파일 생성:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generatePharmacyContent } from "@/lib/gemini";
import { getPharmacyByHpid } from "@/lib/data/pharmacies";

export async function POST(request: NextRequest) {
  try {
    const { hpid } = await request.json();
    
    if (!hpid) {
      return NextResponse.json({ error: "hpid is required" }, { status: 400 });
    }

    // 약국 정보 가져오기
    const pharmacy = await getPharmacyByHpid(hpid);
    if (!pharmacy) {
      return NextResponse.json({ error: "Pharmacy not found" }, { status: 404 });
    }

    // Gemini 컨텐츠 생성
    const content = await generatePharmacyContent(pharmacy);
    
    if (!content) {
      return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
    }

    // Supabase에 저장
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // pharmacies 테이블에 gemini_summary 저장
    const { error: updateError } = await supabase
      .from("pharmacies")
      .update({
        gemini_summary: content.summary,
        updated_at: new Date().toISOString(),
      })
      .eq("hpid", hpid);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      hpid,
      summary: content.summary 
    });
  } catch (error) {
    console.error("Error generating pharmacy content:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### 2. API 호출

```bash
curl -X POST https://todaypharm.kr/api/generate-pharmacy \
  -H "Content-Type: application/json" \
  -d '{"hpid": "C1109587"}'
```

또는 브라우저에서:

```javascript
fetch('/api/generate-pharmacy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ hpid: 'C1109587' })
})
```

## 방법 4: Vercel Cron Jobs 사용

### 1. `vercel.json` 설정

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-content",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### 2. Cron API 엔드포인트 생성

`src/app/api/cron/generate-content/route.ts` 파일 생성하여 배치로 컨텐츠 생성

## 추천 방법

**가장 간단하고 안전한 방법은 방법 1 (GitHub Actions)**입니다:

✅ 장점:
- Vercel 환경 변수와 분리되어 안전
- 실행 이력 관리 가능
- 로그 확인 용이
- 수동 실행 가능

✅ 사용법:
1. GitHub 저장소 → Actions 탭
2. "Generate Single Pharmacy Content" 선택
3. "Run workflow" 클릭
4. HPID 입력 (C1109587)
5. 실행 완료 대기

## 현재 설정된 워크플로우

- ✅ `generate-single-pharmacy.yml`: 단일 약국 컨텐츠 생성
- ✅ `generate-content.yml`: 배치 컨텐츠 생성
- ✅ `scheduled-publish.yml`: 큐 발행

## 참고사항

1. **환경 변수**: Vercel 대시보드에서 환경 변수가 설정되어 있어야 합니다.
2. **Supabase 테이블**: `pharmacies` 테이블에 `gemini_summary` 컬럼이 있어야 합니다.
3. **API 키**: Gemini API 키가 유효해야 합니다.

