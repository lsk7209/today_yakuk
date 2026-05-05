# Status | 마지막: 2026-05-05
## 현재 작업
전체 캠페인 글 106개 품질 보정 완료, Action 성공 확인
## 최근 변경 (최근 5개만)
- 05-05: v1/v2/v3 캠페인 글 106개 조사·문장 품질 보정 및 85점 이상 게이트 확장
- 05-05: v3 POST_COUNT 4로 확장해 야간·주말 약국 글 2개 추가 생성
- 05-05: v3 야간·주말 약국 콘텐츠 2개 추가 계획 수립
- 05-05: v1 캠페인 생성 스크립트 ts-node 컴파일 실패와 FAQ 조사 오류 수정
- 05-05: 캠페인 글 조사 오류 추가 보정 및 생성 스크립트 조사 헬퍼 보강
## TODO
- [x] v3 campaign 4개 생성 및 로컬 검증
- [x] Seed Blog Campaign v3 Action 성공 확인
- [x] 캠페인 글 106개 품질 점수 85점 이상 로컬 검증
- [x] Repair Blog Content Quality Action 성공 확인
- [ ] 신규 2개 발행 후 RSS/sitemap 반영 확인
## 결정사항
- Daum: 공개 URL 제출 API가 없어 RSS와 sitemap 기반 발견 경로로 운영
- Google: Indexing API는 호출하되 일반 블로그 색인은 sitemap/GSC 발견 경로도 병행
## 주의
- 로컬은 Supabase env가 없어 더미 클라이언트로 검증됨
- Google Indexing API는 공식적으로 JobPosting/BroadcastEvent 중심이라 일반 글 색인 보장은 아님
