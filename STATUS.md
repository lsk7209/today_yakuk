# Status | 마지막: 2026-05-05
## 현재 작업
GPS 위치 권한 UX 개선 완료, 배포 후 live 확인 대기
## 최근 변경 (최근 5개만)
- 05-05: 홈에 신뢰 정보 섹션과 주요 가이드 섹션 추가
- 05-05: RSS charset/cache, sitemap/blog 최신 발행 정렬 보강
- 05-05: v3 제목 CSV 100개와 예약 글 2개 생성, Seed Actions 성공
- 05-05: GSC sitemap 재제출, 오류/경고 0개와 pending 확인
- 05-05: 홈/nearby GPS 권한을 버튼 클릭 흐름으로 변경, 키워드 검색 API 보강
## TODO
- [ ] 배포 완료 후 live 홈/nearby GPS 버튼과 `/api/nearby` 응답 확인
- [ ] v3 첫 글 발행 후 `/blog`, RSS, sitemap 반영 확인
## 결정사항
- 댓글: Next.js 사이트라 WordPress 댓글 기능 없음
- FlowMattic/Rank Math: WordPress 플러그인 대상이 아님, Next 메타/JSON-LD/자동화로 처리
- GPS: 접속 즉시 권한 요청 대신 사용자가 버튼을 누른 뒤 브라우저 권한 요청
## 주의
- 로컬은 Supabase env가 없어 더미 클라이언트로 검증됨
- AdSense 사이트 상태는 `todaypharm.kr: GETTING_READY`, GSC 최근 90일 검색 데이터는 0건
