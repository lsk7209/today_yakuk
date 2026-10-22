# 배포 및 롤백

## 현재 적용 상태

- 로컬 코드/읽기 전용 DB 감사/사본 manifest 검증: 적용됨.
- 운영 DB migration, 상태 backfill, 대량 URL 전환, Git push, Vercel 배포, DNS/메일/AdSense/GSC 변경: 실행하지 않음(승인 대기).

## 안전한 릴리스 순서

1. 현재 원격 `main`에서 깨끗한 통합 worktree를 만들고 이 작업의 소유 파일만 이식한다. dirty primary 전체를 push하지 않는다.
2. CI에서 quality unit test, manifest fixture, lint, typecheck, build, 대표 route smoke를 실행한다.
3. 운영 DB의 암호화 백업/복구 시험과 schema 사본을 만든다. 비밀값과 좌표를 산출물에 넣지 않는다.
4. `scripts/sql/20260912_content_quality_policy_turso.sql`을 운영 사본에 먼저 적용하고 기존 published 수가 보존되는지 확인한다.
5. 앱 코드를 배포하되 광고 serving/affiliate 플래그는 false로 유지한다. meta/ads.txt 소유권 확인은 보존한다.
6. 운영에서 404, 공개 글, 보류 글, API, RSS, sitemap, 약국/위키 표본, 광고 네트워크 요청 부재를 확인한다.
7. 검토된 content-change manifest만 dry-run 결과와 영향 수를 승인받아 소량 batch로 적용한다. 영구 삭제는 제외한다.
8. Search Console sitemap 확인과 AdSense Auto ads URL 제외는 운영자 계정에서 별도 수행한다.

## 롤백

- 코드: 통합 릴리스 commit을 revert한다. dirty primary를 reset하지 않는다.
- 콘텐츠 상태: 적용 당시 hash와 현재 hash가 같은 레코드만 inverse manifest로 되돌린다. 이후 편집이 있으면 충돌로 중단한다.
- schema: 새 컬럼은 즉시 drop하지 않는다. 구버전 코드는 기존 `status`를 계속 읽을 수 있으며, schema 제거는 별도 점검 후 수행한다.
- 광고: serving/affiliate 플래그를 false로 유지/복원하면 script와 slot 요청이 중단된다. publisher meta/ads.txt는 삭제하지 않는다.
- 캐시: 상태 변경 후 관련 HTML/API/RSS/sitemap tag 또는 CDN 경로만 선택적으로 무효화한다.

## 중단 조건

기존 공개 수 감소, pending 원문 노출, hash 충돌, redirect 순환, 광고 제외 화면의 광고 요청, build/route smoke 실패가 하나라도 있으면 다음 단계로 진행하지 않는다.

