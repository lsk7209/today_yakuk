### 목표
- 구글 크롤 최적화: 2만+ 상세 페이지 자연 노출, 중복 최소화, AEO/SEO/Geo 강화
- 설정: sitemap 10k/파일, 페이지네이션 50개/페이지, 자동 발행 최대 10건/일

### 구현 계획
1) **사이트맵 인덱스 확장**  
   - `src/app/sitemap.ts`: `generateSitemaps`로 총 hpid 수를 10k 청크로 나누어 id 배열 반환.  
   - `sitemap`에서 id 기반으로 Supabase hpid 청크 쿼리 → URL 리스트 반환.  
   - 필요 시 허브/테마/정적 페이지도 포함.  
   - robots는 기존 `/sitemap.xml` 유지(인덱스 역할).

2) **크롤러용 페이지네이션 노출(50개/페이지)**  
   - `src/app/[province]/[city]/page.tsx`: `searchParams.page/limit` 처리, 기본 50개, SSR 페이지네이터 렌더.  
   - 무한스크롤은 UX용으로 유지하되, 크롤러가 따라갈 수 있는 페이지네이션 링크 병행 노출.  
   - 데이터 쿼리 함수에 `limit/offset` 지원 추가.

3) **내부링크/AEO 유지**  
   - 추천/대체 리스트 등 상세 → 상세 링크 유지(현행).  
   - 리스트/페이지네이터 링크가 HTML에 노출되도록 보장.

4) **발행 스케줄(별도 단계)**  
   - 하루 최대 10건(5회×2건) 자동 발행/갱신을 위한 큐 테이블/워크플로우는 후속 단계에서 구현.

### 참고
- Next.js `generateSitemaps`/다중 sitemap: https://github.com/vercel/next.js/blob/canary/docs/01-app/03-api-reference/04-functions/generate-sitemaps.mdx

