# 실제 라우트와 CITY SIGNAL 디자인 파일 대응표

기준: 앞서 확인된 `lsk7209/today_yakuk` 공개 Next.js App Router 구조. 실제 배포 환경이나 저장소 변경 후 다시 확인해야 합니다.

| 메뉴/화면 | 현재 Next.js 경로 | 목업 파일 |
|---|---|---|
| 메인 | `/` | `index.html` |
| 내 주변 약국 | `/nearby` | `pages/nearby.html` |
| 지역 목록 | `/[province]/[city]` | `pages/region.html` |
| 약국 상세 | `/pharmacy/[id]` | `pages/pharmacy.html` |
| 이용 가이드 | `/guide` | `pages/guide.html` |
| 가이드 상세 | `/guide/night-weekend` 등 `/guide/*` | `pages/guide-article.html` |
| 블로그 목록 | `/blog` | `pages/blog.html` |
| 블로그 글 | `/blog/[slug]`, 일부 `/blog/*` | `pages/blog-article.html` |
| 영양제 위키 | `/wiki` | `pages/wiki.html` |
| 건강기능식품 상세 | `/wiki/product/[id]` | `pages/wiki-product.html` |
| 의약품 상세 | `/wiki/medicine/[id]` | `pages/wiki-medicine.html` |
| 성분 상세 | `/wiki/ingredient/[name]` | `pages/wiki-ingredient.html` |
| 제품 비교 | `/wiki/vs/[compareId]` | `pages/wiki-compare.html` |
| 태그별 상세 | `/wiki/tag/[keyword]` | `pages/wiki-tag.html` |
| 주제 허브 | `/hub/[slug]` | `pages/topic-hub.html` |
| 소개 | `/about` | `pages/about.html` |
| 문의 | `/contact` | `pages/contact.html` |
| 개인정보 처리방침 | `/privacy` | `pages/privacy.html` |
| 이용약관 | `/terms` | `pages/terms.html` |
| 없는 페이지 | `src/app/not-found.tsx` | `pages/not-found.html` |

## 기본 작업 제외

- `/admin`, `/admin/login`, `/api/*`: 관리자 운영 화면과 API는 **이번 공개 페이지 리디자인에서 제외**.
- `feed.xml`, `rss.xml`, `sitemap*.xml`, `robots.ts`, `manifest.ts`: SEO 및 시스템 기능으로, 시각 디자인 범위 밖.
- `src/app/error.tsx`, loading 화면: 공개 UI 구현 시 기존 기능을 유지하고 공통 디자인 토큰만 안전하게 적용 가능.

## 실서비스 구현 제안

1. `src/app/globals.css` + `tailwind.config.ts`에 신규 토큰을 충돌 없이 추가. 기존 기능상 클래스 이름과 구분할 수 있도록 네임스페이스 설계.
2. `src/app/layout.tsx` 헤더·푸터와 공통 콘텐츠 컴포넌트부터 적용.
3. `src/app/page.tsx`, `src/app/nearby/NearbyClient.tsx`, `src/app/[province]/[city]/page.tsx`, `src/app/pharmacy/[id]/page.tsx`에 기능 보존형 UI 리팩토링.
4. `guide`, `blog`, `wiki` 순으로 목록/상세 템플릿을 구현.
5. `/about`, `/contact`, `/privacy`, `/terms`는 기존 콘텐츠와 법적 문구를 보존한 채 가독성 중심으로 반영.
