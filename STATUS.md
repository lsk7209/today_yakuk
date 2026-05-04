# Status | 마지막: 2026-05-04
## 현재 작업
v2 제목 100개·본문 2개 생성 및 추가 예약 적재 완료
## 최근 변경
- 05-04: 기존 100개 캠페인 유지 결정
- 05-04: v2 제목 CSV 100개 생성, 기존 후보/예약과 중복 검사
- 05-04: v2 본문 2개 생성, 품질 최저 97점, FAQ 4개, 본문 2,771자 이상
- 05-04: v2 예약 시간은 2026-05-25 18:30/23:30 KST로 기존 마지막 이후 5시간 간격
- 05-04: `seed-blog-campaign-v2` Actions 성공, Supabase 추가 적재 완료
## TODO
- [x] v2 push 후 `Seed Blog Campaign v2` Actions 성공 확인
- [ ] v2 첫 글 발행 후 `/blog`, RSS, sitemap 확인
## 결정사항
- v2: 제목은 100개 만들고 본문/예약은 상위 2개만 추가
- 기존 100개 예약은 삭제·수정하지 않음
## 주의
- 로컬에는 Supabase env가 없어 DB 적재는 GitHub Secrets 기반 Actions로 수행
- `tmux`가 없어 OMX tmux team 대신 3개 읽기 전용 검토 에이전트로 대체
