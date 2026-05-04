# Status | 마지막: 2026-05-04
## 현재 작업
속도·SEO·보안 2차 안정화 및 GSC www 검증/사이트맵 제출 완료
## 최근 변경
- 05-04: `/nearby` 전용 metadata 추가, `/wiki` canonical 추가, 블로그/허브 HTML sanitizer 적용
- 05-04: `www.todaypharm.kr` GSC 검증용 Google meta token 추가
- 05-04: `www.todaypharm.kr` Search Console 소유권 검증 및 sitemap 제출 완료(오류 0/경고 0)
- 05-04: 관리자 로그인 10분 5회 제한 추가, 블로그 OG 이미지 URL www 도메인 통일
- 05-04: 블로그 목록 페이지네이션 적용으로 `/blog` 응답 크기 대폭 축소
## TODO
- [ ] AdSense 콘솔에서 `todaypharm.kr` 심사 진행 상태와 결제 확인 알림 조치
## 결정사항
- 애드센스 퍼블리셔 ID는 공통 레이아웃에서 기본값으로도 주입
- 루트 sitemap.xml은 rewrite로 sitemap-index.xml에 연결하고, 하위 sitemap은 Next metadata 경로를 유지
- GA 측정 ID는 환경변수가 없어도 `G-NPMV2G9KPK` 기본값으로 주입
- 운영 도메인은 `https://www.todaypharm.kr`로 통일
## 주의
- `.omx/`는 작업 산출물이며 커밋 대상 아님
- 로컬에는 Supabase env가 없어 빌드 시 더미 클라이언트 경고가 출력됨
- AdSense OAuth 파일/토큰은 `D:\env\adsense_oauth_client.json`, `D:\env\adsense_token.json`
- GSC `www.todaypharm.kr` URL Inspection 결과: Submitted and indexed
