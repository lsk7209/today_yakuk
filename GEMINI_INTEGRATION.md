# Gemini API 통합 가이드

## 개요

이 저장소에는 Gemini API를 활용한 “선택 기능”이 포함되어 있습니다.

- **현재(기본 동작)**: 약국 상세 페이지는 **AI 없이도** 영업시간/지역/전화/근처 비교/FAQ를 조합한 **알고리즘 기반 고유 템플릿**으로 구성됩니다.
- **선택(고급)**: 일부 페이지에만 추가 요약/가이드를 생성하고 싶을 때, **수동 워크플로우**로 Gemini를 사용할 수 있습니다.

## 구현 내용

### 1. Gemini API 유틸리티 (`src/lib/gemini.ts`)

- **함수**: `generatePharmacyContent(pharmacy, nearbyPharmacies)`
- **기능**: 약국 정보를 기반으로 Gemini API를 호출하여 고유한 컨텐츠 생성
- **생성 컨텐츠**:
  - `summary`: 약국 요약 설명 (2~4문장)
  - `detailed_description`: 상세 설명 (3~5문장)
  - `bullets`: 주요 특징 리스트
  - `local_tips`: 지역 특성에 맞는 이용 팁
  - `nearby_landmarks`: 주변 주요 랜드마크/시설
  - `faq`: 자주 묻는 질문 (3~5개)
  - `cta`: 행동 유도 문구
  - `extra_sections`: 추가 안내 섹션

### 2. 상세 페이지 통합 (`src/app/pharmacy/[id]/page.tsx`)

- **현재 로직(업데이트됨)**:
  - Gemini 실시간 생성은 **중단**되었습니다.
  - 페이지는 `src/lib/pharmacy-detail-template.ts`의 알고리즘 템플릿으로 고유 설명/FAQ를 생성합니다.

## 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

※ **선택 사항**입니다. 기본 상세 페이지/SEO에는 필요하지 않습니다.  
Gemini API 키는 [Google AI Studio](https://makersuite.google.com/app/apikey)에서 발급받을 수 있습니다.

## 사용되는 약국 정보

Gemini API에 전달되는 약국 정보:

- **기본 정보**: 이름, 주소, 전화번호, 지역(시/도, 시/군/구)
- **영업시간**: 요일별 영업시간 (월~일, 공휴일)
- **현재 상태**: 영업 중/곧 종료/영업 종료/정보 없음
- **약국 설명**: `description_raw` 필드
- **주변 약국**: 반경 2km 내 약국 정보 (최대 5개)

## 프롬프트 구조

프롬프트는 다음 정보를 포함합니다:

1. 약국 기본 정보
2. 영업시간 정보 (요일별)
3. 오늘 영업시간
4. 약국 설명
5. 주변 약국 정보

## 생성 규칙

Gemini API가 생성하는 컨텐츠는 다음 규칙을 따릅니다:

- ✅ 존댓말 사용
- ✅ 과장이나 광고성 표현 금지
- ✅ 의료행위나 진단에 대한 내용 절대 금지
- ✅ 제공된 약국 정보만을 바탕으로 작성 (추측 금지)
- ✅ 지역 특성과 영업시간 정보 최대한 활용
- ✅ 독자적이고 유용한 정보 제공

## 성능 고려사항

- **기본 동작**: 상세 페이지에서 Gemini API 호출이 없으므로, 비용/지연/장애 영향이 없습니다.
- **선택 기능 사용 시**: Gemini API 사용량에 따라 비용이 발생합니다.

## 향후 개선 사항

1. **선택적 보강**: 트래픽 상위/핵심 지역 페이지에만 AI 보강
2. **수동 워크플로우 유지**: 대량 생성 스케줄은 사용하지 않고 필요 시만 실행
3. **템플릿 고도화**: 운영패턴/근처 비교/FAQ를 더 정교하게 확장

## 문제 해결

### API 키 오류
```
GEMINI_API_KEY가 설정되지 않았습니다.
```
→ (선택 기능 사용 시에만) `.env.local` 파일에 `GEMINI_API_KEY` 환경 변수를 추가하세요.

### API 호출 실패
- 네트워크 오류: 재시도 로직 추가 고려
- Rate Limit: API 사용량 확인 및 제한 조정
- 응답 파싱 오류: 로그 확인 및 프롬프트 개선

## 참고 자료

- [Gemini API 문서](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)

