# Status | 마지막: 2026-05-04
## 현재 작업
속도·SEO·보안 2차 안정화 완료, GSC www 속성 검증은 콘솔 조치 필요
## 최근 변경
- 05-04: `/nearby` 전용 metadata 추가, `/wiki` canonical 추가, 블로그/허브 HTML sanitizer 적용
- 05-04: `www.todaypharm.kr` GSC 검증용 Google meta token 추가
- 05-04: 관리자 로그인 10분 5회 제한 추가, 블로그 OG 이미지 URL www 도메인 통일
- 05-04: 블로그 목록 페이지네이션 적용으로 `/blog` 응답 크기 대폭 축소
- 05-04: GA4/AdSense 스크립트 로딩 전략을 Next Script 기반으로 최적화
- 05-04: robots AI봇 허용 보강, admin/API admin 차단, sitemap 재검증 설정 추가
## TODO
- [ ] Git 커밋 및 원격 푸시
- [ ] AdSense 콘솔에서 `todaypharm.kr` 심사 진행 상태와 결제 확인 알림 조치
- [ ] Search Console에서 `https://www.todaypharm.kr/` 또는 `sc-domain:todaypharm.kr` 검증 완료 후 sitemap 제출
## 결정사항
- 애드센스 퍼블리셔 ID는 공통 레이아웃에서 기본값으로도 주입
- 루트 sitemap.xml은 rewrite로 sitemap-index.xml에 연결하고, 하위 sitemap은 Next metadata 경로를 유지
- GA 측정 ID는 환경변수가 없어도 `G-NPMV2G9KPK` 기본값으로 주입
- 운영 도메인은 `https://www.todaypharm.kr`로 통일
## 주의
- `.omx/`는 작업 산출물이며 커밋 대상 아님
- 로컬에는 Supabase env가 없어 빌드 시 더미 클라이언트 경고가 출력됨
- AdSense OAuth 파일/토큰은 `D:\env\adsense_oauth_client.json`, `D:\env\adsense_token.json`
- GSC API로 www 속성 추가는 됐지만 소유권 검증이 안 되어 URL Inspection은 아직 실패
