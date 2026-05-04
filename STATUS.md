# Status | 마지막: 2026-05-05
## 현재 작업
검색엔진 발행 알림과 콘텐츠 조사 오류 보정 배포 확인 중
## 최근 변경 (최근 5개만)
- 05-05: 캠페인 글 조사 오류 추가 보정 및 생성 스크립트 조사 헬퍼 보강
- 05-05: 발행 시 IndexNow/Bing/Naver/Yandex 동시 알림으로 보강
- 05-05: 05-04 캠페인 글 100개 조사 오류 보정 스크립트와 GitHub Action 추가
- 05-05: AdSense 스크립트 head 속성 경고 제거 방식으로 수정
- 05-05: 홈 CTA 대비, 내비게이션 터치 타깃, llms.txt 링크 구조 개선
## TODO
- [ ] 푸시 후 GitHub Action repair 로그 재확인
- [ ] live RSS 최신 글 설명문 조사 오류 수정 반영 확인
- [ ] live sitemap, llms.txt, 블로그 목록 반영 확인
## 결정사항
- Daum: 공개 URL 제출 API가 없어 RSS와 sitemap 기반 발견 경로로 운영
- Google: Indexing API는 호출하되 일반 블로그 색인은 sitemap/GSC 발견 경로도 병행
## 주의
- 로컬은 Supabase env가 없어 더미 클라이언트로 검증됨
- Google Indexing API는 공식적으로 JobPosting/BroadcastEvent 중심이라 일반 글 색인 보장은 아님
