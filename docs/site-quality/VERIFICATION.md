# 검증 결과

기준: 2026-09-12 KST, 현재 로컬 checkout. 운영 배포·운영 DB 쓰기·대량 URL 전환은 수행하지 않았다.

| 검증 | 결과 | 증거/해석 |
|---|---|---|
| 품질 단위 테스트 | 완료 | `npm run test:quality`: 14/14 통과(HTML 공격 payload 포함) |
| TypeScript | 완료 | `npx tsc --noEmit --incremental false`: 오류 없음 |
| Next.js production build | 완료 | `npm run build`: static generation 150/150 성공 |
| Playwright desktop/mobile | 완료 | production build 기준 Chromium + Mobile Chrome 22/22 통과 |
| editorial 구조 검사 | 완료 | 10 posts, 10 images, 최소 text 1200 통과. 전문 검수 증거는 아님 |
| editorial 공개 누출 회귀 | 완료 | 5개 대표 초안 HTTP 404, `private, no-store`, X-Robots-Tag; 블로그 목록/sitemap 참조 0 |
| URL/콘텐츠 감사 | 완료 | 80,335 URL, 810 결정 행, 1,729 주장 후보 생성 |
| 신규 API 데이터 델타 | 완료 | 2026-09-12T08:44:28.512Z 기준 79,507건 비교; 신규 0, 변경 0, 누락 0 |
| 변경 manifest | 완료 | dry-run, copy apply, idempotence, rollback 통과. live DB 미적용 |
| HTTP smoke | 완료 | 주요 공개·정책 URL 200, 없는 URL 404 |
| wiki canonical 회귀 | 완료 | 한글 canonical URL 200 + h1, redirect marker 없음 |
| 광고 비요청 | 완료(로컬 기본값) | serving/affiliate 기본 false. AdSense 소유권 meta 유지 |
| 운영 DB migration | 승인 대기 | additive SQL/코드만 작성. copy/사전 비교 후 적용 필요 |
| 배포/GSC/AdSense UI | 검증 불가·미실행 | 권한 경계상 실행하지 않음 |

## 실패 이력과 해석

- 첫 Chromium 실행의 wiki selector 중복 1건을 href 기반으로 수정 후 11/11 통과했다.
- 전체 E2E 한 차례는 Playwright dev server가 production `.next`를 덮어써 500이 발생했다. listener 종료, clean build, 단일 port 재실행 후 22/22 통과했다.

## 남은 검증 공백

- claims CSV 1,729건은 휴리스틱 후보이며 사실 판정이 아니다.
- 약사·의사 검수, GSC 실제 색인, AdSense 계정 설정, 운영 메일 수신, 실운영 트래픽은 확인하지 않았다.
- 공공데이터 `updated_at`은 원천 갱신일·전화 확인일로 해석하면 안 된다.
- editorial 구조 검사는 출처·의료 검수 통과가 아니다. 명시적 release manifest가 없는 글은 공개하지 않는다.
- `public_data_sync_runs` 최신 실행 기록이 있어도 ID/감사 필드 해시 변화가 없으면 신규 콘텐츠 근거로 사용하지 않는다.
