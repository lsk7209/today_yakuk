# Project Operating Notes

## Public Data & Enrichment Sync Cycles

- **약국 기본 공공데이터 (`pharmacies`)**: 공공데이터포털 응급의료 정보 기반으로 **매일 04:00 KST(19:00 UTC)** 1회 자동 동기화됩니다 (`daily-sync.yml`).
- **건기식 및 의약품 (`hff`, `medicines`)**: 식품안전나라 및 의약품안전나라 주간 갱신 주기에 맞춰 **매주 월요일 04:30 KST(일요일 19:30 UTC)** 1회 동기화됩니다.
- **약국 인텔리전스 보완 파이프라인 (`enrich-pharmacies`)**:
  - 미보완 잔여 약국이 있는 동안: IP 차단 방지를 위해 정기 배치로 균등 분할 처리.
  - 초도 보완 완료 후 상시 운영: 공공데이터 일일 동기화 이후 신규 등록/정보 변경 약국만 선별 보완.
- 불필요한 반복 질문 멘트는 생략하며, 사용자의 명시적 요청 시에만 수집/배포 작업을 진행합니다.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
