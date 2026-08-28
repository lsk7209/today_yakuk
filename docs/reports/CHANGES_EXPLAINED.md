# 변경사항 상세 설명

## 🔍 실제로 바뀐 부분

### 1. **"약국 소개" 섹션의 내용 우선순위 변경**

**이전 (변경 전)**:
```
약국 소개 = pharmacies.gemini_summary 또는 템플릿 기반 요약
```

**현재 (변경 후)**:
```
약국 소개 = content_queue.ai_summary (최우선) 
         → pharmacies.gemini_summary (차선)
         → 템플릿 기반 요약 (최후)
```

### 2. **변경 전후 비교**

#### 변경 전 예시 (C2100016):
```
"1,2,3약국(경기 남양주시)은(는) 경기도 남양주시 오남읍 양지로 47-63에 위치한 약국입니다. 
현재 상태는 '영업 종료'이며, 월 기준 영업시간은 09:00~18:00로 표시됩니다..."
```
→ 이것은 **템플릿 기반** 자동 생성 문구입니다.

#### 변경 후 예시 (C2100016):
```
"경기 남양주시의 1,2,3약국은 현재 영업 종료 상태입니다. 오늘 운영 예정 시간은 09:00부터 
18:00까지입니다. 이 약국은 오남읍 양지로 47-63에 위치해 있으며..."
```
→ 이것은 **Gemini AI가 생성한** 고유한 문구입니다.

### 3. **왜 변화가 안 보일 수 있나요?**

#### 가능한 이유 1: 배포가 아직 안 됨
- 로컬 개발 서버를 재시작하지 않았거나
- Vercel 배포가 아직 진행 중일 수 있습니다

#### 가능한 이유 2: content_queue 데이터가 없음
- `content_queue` 테이블에 해당 약국의 데이터가 없으면
- 기존처럼 `pharmacies.gemini_summary` 또는 템플릿을 사용합니다

#### 가능한 이유 3: pending 상태
- 생성된 콘텐츠가 `pending` 상태인데
- 코드가 `pending`도 읽어오도록 수정했지만
- 실제로 데이터베이스에서 읽어오지 못할 수 있습니다

## 🔧 확인 방법

### 1. 개발 서버에서 확인
```bash
npm run dev
```
- http://localhost:3000/pharmacy/C2100016 접속
- "약국 소개" 섹션 확인

### 2. 데이터베이스 확인
Supabase에서 확인:
```sql
SELECT hpid, status, ai_summary 
FROM content_queue 
WHERE hpid IN ('C2100016', 'C2108696');
```

### 3. 실제 변화가 보이는 경우
- **변화 있음**: "약국 소개" 문구가 더 자연스럽고 상세해짐
- **변화 없음**: 여전히 템플릿 기반 문구가 표시됨

## 📝 코드 변경 위치

### 파일: `src/app/pharmacy/[id]/page.tsx`

**변경 전 (라인 163)**:
```typescript
const [pharmacy] = await Promise.all([pharmacyPromise]);
```

**변경 후 (라인 163-166)**:
```typescript
const [pharmacy, contentQueue] = await Promise.all([
  pharmacyPromise,
  getPublishedContentByHpid(hpid).catch(() => null),
]);
```

**변경 전 (라인 319)**:
```typescript
{pharmacy.gemini_summary || finalSummary}
```

**변경 후 (라인 325)**:
```typescript
{contentQueue?.ai_summary || pharmacy.gemini_summary || finalSummary}
```

## 🎯 핵심 포인트

**변화가 보이려면**:
1. ✅ 코드가 배포되어야 함 (Vercel)
2. ✅ `content_queue` 테이블에 데이터가 있어야 함
3. ✅ `status`가 `published` 또는 `pending`이어야 함
4. ✅ `ai_summary` 필드에 값이 있어야 함

**현재 상태**:
- ✅ 코드는 수정 완료
- ✅ GitHub에 푸시 완료
- ⏳ Vercel 배포 대기 중
- ❓ `content_queue` 데이터 확인 필요

> Historical snapshot. Current public-content rules allow only `published` rows. See `/PROJECT_STATE.md`.
