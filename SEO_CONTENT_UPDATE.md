# 구글 노출 최적화 가이드

## ✅ 기존 경로에 컨텐츠 추가/변경 시 구글 노출

**네, 맞습니다!** 기존 경로(`/pharmacy/C1109587`)에 컨텐츠를 추가/변경/업데이트하면 구글에 노출됩니다.

## 동작 원리

### 1. **URL 유지**
- 기존 URL: `/pharmacy/C1109587` (변경 없음)
- 구글은 이미 이 URL을 인덱싱하고 있음
- 컨텐츠만 업데이트되므로 URL 변경 없이 새 컨텐츠 반영

### 2. **Sitemap 자동 업데이트**
- `content_queue` 테이블에 컨텐츠 저장 시 `published_at` 기록
- Sitemap의 `lastModified`가 자동으로 업데이트됨
- 구글 크롤러가 sitemap을 확인하면 변경된 페이지를 재크롤링

### 3. **페이지 내용 업데이트**
- 상세 페이지에서 `content_queue`의 컨텐츠를 자동으로 표시
- 기존 구조는 유지하고 AI 생성 컨텐츠가 추가됨
- 구글이 페이지를 재크롤링하면 새로운 컨텐츠를 인덱싱

## 구글 노출 최적화 방법

### 1. **Sitemap 최적화** ✅ (구현 완료)
- `content_queue.published_at`을 sitemap의 `lastModified`로 사용
- 컨텐츠 업데이트 시 sitemap이 자동으로 갱신됨

### 2. **구글에 변경사항 알리기** (선택사항)

#### 방법 A: Google Search Console
1. Google Search Console 접속
2. URL 검사 도구 사용
3. 업데이트된 URL 제출

#### 방법 B: Sitemap Ping
```bash
# Sitemap 업데이트 후 구글에 알림
curl "https://www.google.com/ping?sitemap=https://todaypharm.kr/sitemap.xml"
```

#### 방법 C: Indexing API (고급)
- Google Search Console API를 사용하여 직접 인덱싱 요청

### 3. **컨텐츠 업데이트 시 자동 처리** ✅ (구현 완료)
- 컨텐츠 생성 시 `pharmacies.updated_at`도 업데이트
- Sitemap이 자동으로 최신 시간 반영

## 구글 크롤링 주기

### 일반적인 크롤링 주기
- **새 페이지**: 즉시 ~ 며칠 내
- **업데이트된 페이지**: 
  - Sitemap에 `lastModified`가 있으면 더 빠르게 크롤링
  - 일반적으로 1주일 ~ 1개월 내
  - 인기 있는 페이지는 더 자주 크롤링

### 크롤링 촉진 방법
1. **Sitemap 제출**: Google Search Console에 sitemap 등록
2. **내부 링크**: 다른 페이지에서 링크로 연결
3. **외부 링크**: 소셜 미디어나 다른 사이트에서 링크
4. **정기적 업데이트**: 컨텐츠를 정기적으로 업데이트하면 크롤링 빈도 증가

## 확인 방법

### 1. Google Search Console
- URL 검사 도구로 페이지 상태 확인
- 인덱싱 상태 확인
- 크롤링 이력 확인

### 2. Google 검색
```
site:todaypharm.kr/pharmacy/C1109587
```
- 검색 결과에 나타나는지 확인
- 캐시된 날짜 확인

### 3. 페이지 소스 확인
- 실제 페이지에 AI 생성 컨텐츠가 포함되어 있는지 확인
- 메타데이터가 업데이트되었는지 확인

## 주의사항

### 1. **중복 컨텐츠 방지**
- 같은 내용을 반복하지 않도록 주의
- 각 약국별로 고유한 컨텐츠 생성

### 2. **품질 유지**
- AI 생성 컨텐츠의 품질 확인
- 사실과 다른 정보 포함 방지

### 3. **업데이트 빈도**
- 너무 자주 업데이트하면 구글이 스팸으로 인식할 수 있음
- 의미 있는 업데이트만 수행

## 예상 효과

### 단기 (1-2주)
- 구글이 업데이트된 페이지를 재크롤링
- 새로운 컨텐츠가 인덱싱됨

### 중기 (1-2개월)
- 검색 결과에 새로운 컨텐츠 반영
- 키워드 랭킹 개선 가능

### 장기 (3개월 이상)
- 고유 컨텐츠로 인한 SEO/AEO 효과
- 자연 검색 트래픽 증가

## 참고 자료

- [Google Search Central - 크롤링 가이드](https://developers.google.com/search/docs/crawling-indexing)
- [Sitemap 최적화](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)

