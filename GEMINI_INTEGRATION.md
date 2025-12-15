# Gemini API 통합 가이드

## 개요

약국 상세 페이지에서 공공데이터포털 API에서 가져온 약국 정보를 기반으로 Gemini API를 활용하여 독자적이고 고유한 컨텐츠를 실시간으로 생성합니다.

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

- **로직**: 
  1. 기존 `content_queue` 테이블에서 컨텐츠 확인
  2. 컨텐츠가 없거나 불완전한 경우, Gemini API로 실시간 생성
  3. 생성된 컨텐츠를 페이지에 표시
- **폴백**: API 호출 실패 시 기존 기본 컨텐츠 사용

## 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

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

- **캐싱**: 현재는 매 요청마다 API 호출 (향후 캐싱 전략 고려 필요)
- **에러 핸들링**: API 호출 실패 시 기존 컨텐츠로 폴백
- **비용**: Gemini API 사용량에 따라 비용 발생 (무료 티어 제한 확인 필요)

## 향후 개선 사항

1. **캐싱 전략**: 생성된 컨텐츠를 `content_queue` 테이블에 저장하여 재사용
2. **배치 생성**: 스케줄러를 통해 미리 컨텐츠 생성
3. **컨텐츠 업데이트**: 약국 정보 변경 시 컨텐츠 자동 재생성
4. **A/B 테스팅**: 다양한 프롬프트로 컨텐츠 품질 개선

## 문제 해결

### API 키 오류
```
GEMINI_API_KEY가 설정되지 않았습니다.
```
→ `.env.local` 파일에 `GEMINI_API_KEY` 환경 변수를 추가하세요.

### API 호출 실패
- 네트워크 오류: 재시도 로직 추가 고려
- Rate Limit: API 사용량 확인 및 제한 조정
- 응답 파싱 오류: 로그 확인 및 프롬프트 개선

## 참고 자료

- [Gemini API 문서](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)

