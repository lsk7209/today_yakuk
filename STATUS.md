# Status | 마지막: 2026-04-23
## 현재 작업
Google Analytics 측정 ID 기본값 반영 및 Git 배포 진행 중 (95%)
## 최근 변경
- 04-23: Google Analytics 측정 ID `G-NPMV2G9KPK` 기본값 반영
- 04-23: 네이버 사이트 검증 메타 기본값 추가 및 공통 레이아웃 반영
- 04-23: sitemap.xml rewrite + sitemap-index.xml 인덱스 라우트 적용, 프로덕션 모드 XML 검증 완료
- 04-23: 루트 sitemap.xml 인덱스 라우트 추가 및 RSS www 도메인 통일 작업 시작
- 04-23: lint, type-check, build 통과 후 로컬 브라우저 검증 완료
## TODO
- [ ] Git 커밋 및 원격 푸시
## 결정사항
- 애드센스 퍼블리셔 ID는 공통 레이아웃에서 기본값으로도 주입
- 홈에 고유 텍스트 콘텐츠와 정책 링크를 추가해 검수 신호 보강
- 루트 sitemap.xml은 rewrite로 sitemap-index.xml에 연결하고, 하위 sitemap은 Next metadata 경로를 유지
- 네이버 검증 메타는 환경변수가 없어도 기본값으로 주입
- GA 측정 ID는 환경변수가 없어도 `G-NPMV2G9KPK` 기본값으로 주입
## 주의
- `.omx/`는 작업 산출물이며 커밋 대상 아님
