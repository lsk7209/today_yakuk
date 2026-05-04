# Status | 마지막: 2026-05-05
## 현재 작업
AdSense 승인용 홈/SEO/콘텐츠 최적화 및 v3 글 예약 자동화 배포 완료
## 최근 변경
- 05-05: 홈에 정보 운영 기준과 주요 가이드 섹션 추가
- 05-05: RSS charset/cache, sitemap/blog 최신 발행 정렬 보강
- 05-05: 블로그 상세 감수 배지를 공공데이터 기반 안내로 정정
- 05-05: v3 제목 CSV 100개와 예약 글 2개 생성, Seed Actions 성공
- 05-04: v2 제목 100개와 예약 글 2개 생성
## TODO
- [x] main push 후 `Seed Blog Campaign v3` Actions 성공 확인
- [ ] v3 첫 글 발행 후 `/blog`, RSS, sitemap 반영 확인
## 결정사항
- 댓글: Next.js 사이트에 댓글 기능을 추가하지 않음
- FlowMattic/Rank Math: WordPress 플러그인 대체 대상 아님, Next 메타/JSON-LD/큐로 처리
- 브랜드: `약국오늘` 기준 유지
## 주의
- 로컬에는 Supabase env가 없어 DB 삽입은 GitHub Actions secrets 기반으로 실행
- AdSense 사이트 상태는 `todaypharm.kr: GETTING_READY`, GSC 최근 90일 검색 데이터는 0건
