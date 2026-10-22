# Codex / Claude Code 개발 요청문 — CITY SIGNAL 디자인 적용

> 아래 요청문은 `todaypharm_city_signal_design.zip`의 **검토·승인 이후** 개발을 시작할 때 사용합니다. 이번 디자인 전달 단계에서는 외부 운영 코드를 변경하지 않습니다.

```text
프로젝트: https://github.com/lsk7209/today_yakuk
서비스: https://todaypharm.kr/
목표: 승인된 CITY SIGNAL 디자인을 실제 Next.js/React/Tailwind 프로젝트의 공개 페이지에 반응형으로 적용하되 현재 기능, 콘텐츠, 데이터 정확성, SEO, AdSense 노출 정책, 보안 및 운영 워크플로를 보존한다.

참고 자료:
- 첨부 패키지 preview.html / index.html / pages/*.html
- assets/design.css / assets/design.js / metro-map.svg / wiki-grid.svg
- DESIGN_SYSTEM.md / PAGE_MAP.md / DEVELOPMENT_HANDOFF.md

지시:
1. 먼저 실제 저장소의 최신 main 및 브랜치/개발 규칙, 기존 페이지와 핵심 컴포넌트, 변경 충돌을 확인한다. 첨부 HTML은 디자인 참고자료이지 기능 완성 코드가 아니다.
2. 공통 디자인 토큰, 헤더/푸터, 내비게이션을 중복 없는 React 컴포넌트와 Tailwind 규칙으로 구현한다.
3. 메인 → /nearby → 지역 → 약국 상세 순으로 기능 회귀 없이 적용한다. 운영시간이 실제 현장 실시간 정보로 오해되지 않게 한다.
4. guide/blog/wiki의 목록/상세/태그/비교를 각 템플릿 목적에 맞게 구현한다. 약국 정보/의료 정보는 원문 근거가 없으면 단정하지 않는다.
5. 소개/문의/약관/개인정보/404/오류/로딩 화면을 통일하되 기존 공개 정책과 문의 연락처를 삭제·변경하지 않는다.
6. 기존 공공데이터 수집, Turso 스키마, 광고/제휴 설정, 사이트별 canonical·robots·structured data, 환경변수, Actions 워크플로를 임의 변경하지 않는다.
7. 첨부 정적 목업의 `noindex,nofollow`는 운영 코드에 복사하지 않는다. 기존 색인 정책 유지.
8. 허위 영업시간·지역 평균·리뷰·검수자를 절대 생성하지 않는다. 실제 자료 미확인 상태에서는 ‘확인 필요’로 표시하거나 숨긴다.
9. 데스크톱/태블릿/모바일 Playwright 스크린샷과 E2E 기능, npm test/lint/build, SEO/광고 제외 정책 검사를 통과한다.
10. 작업 결과는 변경 파일 목록, 이전/이후 스크린샷, 테스트 결과, 예외·미검증 항목, 승인받아야 할 배포 작업으로 보고한다.

범위 밖:
- 운영 사이트 배포·비공개 저장소 접근 정책 변경
- Turso 운영 DB 수정·삭제·대량 읽기
- 실제 게시글 내용, 의료 통계, 법적 정책 원문 변경
- AdSense 승인 여부를 조작하는 행위

승인 전에는 별도 브랜치/PR과 테스트까지만 진행한다.
```
