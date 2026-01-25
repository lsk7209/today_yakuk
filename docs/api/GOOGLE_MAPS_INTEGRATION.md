# Google Maps 통합 가이드

## 📋 개요

약국 콘텐츠 생성 시 Google Maps에서 추가 정보를 검색하여 더 풍부하고 정확한 콘텐츠를 생성합니다.

### 수집하는 정보
- ✅ 평점 및 리뷰 수
- ✅ Google Maps 영업시간 정보
- ✅ 사용자 리뷰 (최근 3개)
- ✅ 웹사이트 URL
- ✅ 영업 상태
- ✅ 카테고리 정보

## 🔧 설정 방법

### 1. Google Cloud Console에서 API 키 발급

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택 또는 생성
3. **APIs & Services** → **Library** 이동
4. 다음 API 활성화:
   - **Places API** (필수) ← 이걸 선택하세요
   - **Places API (New)** (선택사항, 현재 코드는 기존 버전 사용)
   
   **참고**: 현재 구현은 **Places API (기존)**를 사용합니다. 
   - 100 million 장소 데이터로 한국 약국 검색에 충분합니다.
   - 안정적이고 검증된 API입니다.
5. **APIs & Services** → **Credentials** 이동
6. **Create Credentials** → **API Key** 선택
7. API 키 복사

### 2. 환경 변수 설정

`.env.local` 파일에 추가:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
# 또는
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

**참고**: `GOOGLE_PLACES_API_KEY`가 없으면 `GOOGLE_MAPS_API_KEY`를 사용합니다.

### 3. API 키 제한 설정 (보안)

Google Cloud Console에서:
1. API 키 클릭
2. **API restrictions**:
   - **Restrict key** 선택
   - **Places API**만 허용
3. **Application restrictions**:
   - **HTTP referrers** 선택
   - 도메인 추가 (예: `todaypharm.kr/*`)

## 💰 비용 정보

### Google Places API 가격 (2024 기준)

- **Text Search**: $32 / 1,000건
- **Place Details**: $17 / 1,000건
- **무료 할당량**: 월 $200 크레딧 (약 6,000건 검색 가능)

**예상 비용**:
- 약국 1개당: 약 $0.05 (검색 + 상세 정보)
- 100개 약국: 약 $5
- 1,000개 약국: 약 $50

## 🚀 사용 방법

### 자동 사용

콘텐츠 생성 시 자동으로 Google Maps 정보를 검색합니다:

```bash
npm run generate:single C2100016
```

### 수동 테스트

```typescript
import { searchPharmacyOnGoogleMaps } from "@/lib/google-maps";

const info = await searchPharmacyOnGoogleMaps(
  "1,2,3약국",
  "경기도 남양주시 오남읍 양지로 47-63"
);

console.log(info);
```

## 📊 수집되는 정보 예시

```typescript
{
  placeId: "ChIJ...",
  name: "1,2,3약국",
  formattedAddress: "경기도 남양주시 오남읍 양지로 47-63",
  rating: 4.5,
  userRatingsTotal: 23,
  openingHours: {
    openNow: false,
    weekdayText: [
      "월요일: 09:00 - 18:00",
      "화요일: 09:00 - 18:00",
      ...
    ]
  },
  reviews: [
    {
      authorName: "홍길동",
      rating: 5,
      text: "친절하고 약도 잘 맞아요...",
      time: 1234567890
    },
    ...
  ],
  website: "https://...",
  internationalPhoneNumber: "+82-31-529-8099",
  businessStatus: "OPERATIONAL",
  types: ["pharmacy", "health", "point_of_interest"]
}
```

## 🎯 Gemini 프롬프트에 포함되는 정보

Google Maps 정보는 Gemini 프롬프트에 다음과 같이 포함됩니다:

```
## Google Maps에서 수집한 추가 정보
- 이름: 1,2,3약국
- 주소: 경기도 남양주시 오남읍 양지로 47-63
- 평점: 4.5/5.0 (23개 리뷰)
- 전화번호: +82-31-529-8099
- 영업 상태: OPERATIONAL
- 영업시간 (Google Maps):
  월요일: 09:00 - 18:00
  화요일: 09:00 - 18:00
  ...
- 최근 리뷰 (3개):
  1. [5/5] 친절하고 약도 잘 맞아요...
  2. [4/5] 위치가 좋고 접근이 편해요...
  3. [5/5] 야간에도 운영해서 좋아요...
- 카테고리: pharmacy, health, point_of_interest

**중요**: Google Maps 정보는 참고용입니다. 제공된 기본 정보와 충돌하면 기본 정보를 우선하세요.
Google Maps의 리뷰나 평점은 사용자 경험을 보완하는 용도로만 활용하세요.
```

## ⚠️ 주의사항

### 1. 정보 충돌 처리
- 기본 정보(pharmacies 테이블)와 Google Maps 정보가 다를 수 있음
- **기본 정보를 우선**하도록 프롬프트에 명시
- Google Maps 정보는 **보완 용도**로만 사용

### 2. API 호출 실패 처리
- Google Maps API 호출 실패 시에도 콘텐츠 생성은 계속 진행
- 에러는 로그에만 기록하고 무시

### 3. 비용 관리
- 대량 생성 시 비용이 발생할 수 있음
- 필요시 선택적으로만 사용 (중요한 약국만)

### 4. 데이터 정확성
- Google Maps 정보는 사용자가 업데이트한 정보일 수 있음
- 공식 데이터와 다를 수 있으므로 검증 필요

## 🔍 문제 해결

### API 키 오류
```
Error: GOOGLE_PLACES_API_KEY가 설정되지 않았습니다.
```
→ `.env.local`에 API 키 추가

### 검색 결과 없음
```
Google Maps에서 약국을 찾을 수 없습니다
```
→ 약국명이나 주소가 Google Maps에 등록되지 않았을 수 있음
→ 콘텐츠 생성은 계속 진행 (Google Maps 정보 없이)

### API 할당량 초과
```
Error: OVER_QUERY_LIMIT
```
→ Google Cloud Console에서 할당량 확인
→ 필요시 결제 정보 추가

## 📝 예시: 개선된 콘텐츠

### Google Maps 정보 없이 (기존)
```
"1,2,3약국(경기 남양주시)은(는) 경기도 남양주시 오남읍 양지로 47-63에 위치한 약국입니다..."
```

### Google Maps 정보 포함 (개선)
```
"경기 남양주시 오남읍에 위치한 1,2,3약국은 Google Maps에서 4.5점의 평점을 받은 약국입니다. 
사용자 리뷰에 따르면 친절한 서비스와 편리한 접근성이 장점으로 꼽힙니다. 
현재 영업 종료 상태이며, 평일 09:00부터 18:00까지 운영합니다..."
```

## 🎯 다음 단계

1. ✅ Google Maps API 키 발급
2. ✅ 환경 변수 설정
3. ✅ 테스트 실행
4. ✅ 비용 모니터링
5. ✅ 콘텐츠 품질 확인

---

**참고**: 
- [Google Places API 문서](https://developers.google.com/maps/documentation/places/web-service)
- [Places API 가격](https://developers.google.com/maps/billing-and-pricing/pricing#places-api)

