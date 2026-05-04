# Status | 마지막: 2026-05-04
## 현재 작업
블로그 제목 100개·본문 100개 생성 및 5시간 예약 발행 파이프라인 구현 완료, DB 적재 완료
## 최근 변경
- 05-04: `prepare-blog-campaign` 스크립트 추가, 제목 CSV와 본문 JSON 100개 생성
- 05-04: 캠페인 품질 게이트 통과(최저 94점), FAQ 최소 4개, 5시간 간격 검증
- 05-04: GitHub Actions `seed-blog-campaign` 추가, main push 시 Supabase 적재
- 05-04: 발행 워크플로 매시간 체크 + `PUBLISH_LIMIT=1`로 조정해 예약 글 1개씩 발행
- 05-04: 발행 전 Gemini 이미지 생성 스텝 제거, OG 이미지 fallback 사용
## TODO
- [x] push 후 `Seed Blog Campaign` Actions 실행 결과 확인
- [ ] 첫 예약 글 발행 후 `/blog`, RSS, sitemap, GSC 색인 요청 확인
## 결정사항
- 100개 글: 외부 AI API 없이 직접 생성 템플릿과 품질 게이트로 작성
- 발행 간격: 첫 글부터 5시간마다 예약, 발행기는 한 번에 1개만 처리
## 주의
- 로컬에는 Supabase env가 없어 DB 적재는 GitHub Secrets 기반 Actions로 수행
- `.omx/`는 로컬 작업 산출물이며 커밋 대상 아님
